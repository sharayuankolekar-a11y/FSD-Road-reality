const express = require("express");
const supabase = require("../supabase");
const { authenticateToken, requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper to check if Supabase client is configured
const checkSupabaseConfigured = (res) => {
  if (!supabase) {
    res.status(503).json({
      success: false,
      message: "Database connection unavailable. Please set valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env"
    });
    return false;
  }
  return true;
};

// Helper: Haversine distance in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/*
  GET NEARBY HAZARD REPORTS
  GET /api/reports/nearby?lat=...&lng=...&radius=...
*/
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and longitude (lng) parameters are required"
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radKm = Number(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radKm) || radKm <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lat, lng, or radius query parameters"
      });
    }

    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch nearby reports"
      });
    }

    // Filter reports within radius (in kilometers)
    const nearbyReports = data.filter((report) => {
      if (typeof report.latitude !== "number" || typeof report.longitude !== "number") return false;
      const dist = haversineKm(latitude, longitude, report.latitude, report.longitude);
      return dist <= radKm;
    });

    res.json({
      success: true,
      center: { latitude, longitude },
      radiusKm: radKm,
      count: nearbyReports.length,
      reports: nearbyReports
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  GET USER'S OWN REPORTS
  GET /api/reports/my-reports
*/
router.get("/my-reports", requireAuth, async (req, res) => {
  try {
    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user reports"
      });
    }

    res.json({
      success: true,
      count: data.length,
      reports: data
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  GET REPORT STATISTICS (Total, Pending, Verified, Resolved)
  GET /api/reports/stats
*/
router.get("/stats", async (req, res) => {
  try {
    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .select("status");

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch report statistics"
      });
    }

    const total = data.length;
    const reported = data.filter(r => r.status === "REPORTED").length;
    const verified = data.filter(r => r.status === "VERIFIED").length;
    const inProgress = data.filter(r => r.status === "IN_PROGRESS").length;
    const resolved = data.filter(r => r.status === "RESOLVED").length;

    res.json({
      success: true,
      stats: {
        total,
        active: reported + verified + inProgress,
        reported,
        verified,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  CREATE A NEW ROAD HAZARD REPORT
  POST /api/reports
*/
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      hazard_type,
      category,
      description,
      latitude,
      longitude,
      severity,
      traffic_affected,
      trafficImpact,
      photo_url,
      imageUrl
    } = req.body;

    const finalType = hazard_type || category;
    const finalSeverity = severity || "medium";
    const finalPhoto = photo_url || imageUrl || null;
    const finalTraffic = traffic_affected !== undefined ? traffic_affected : (trafficImpact === "yes");

    // Input Validation: Required fields
    if (
      !finalType ||
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Hazard type, latitude, and longitude are required"
      });
    }

    // Input Validation: Numeric coordinates
    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers"
      });
    }

    if (!checkSupabaseConfigured(res)) return;

    const userId = req.user ? req.user.id : null;

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          user_id: userId,
          hazard_type: finalType,
          description: description || null,
          latitude: Number(latitude),
          longitude: Number(longitude),
          severity: finalSeverity,
          traffic_affected: finalTraffic,
          photo_url: finalPhoto,
          status: "REPORTED"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create report"
      });
    }

    res.status(201).json({
      success: true,
      message: "Road hazard reported successfully",
      report: data
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  GET ALL ROAD HAZARD REPORTS (Newest First)
  GET /api/reports
*/
router.get("/", async (req, res) => {
  try {
    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reports"
      });
    }

    res.json({
      success: true,
      count: data.length,
      reports: data
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  GET ONE REPORT BY ID
  GET /api/reports/:id
*/
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      report: data
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  UPDATE REPORT STATUS (ADMIN ONLY)
  PUT /api/reports/:id/status
*/
router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "REPORTED",
      "VERIFIED",
      "IN_PROGRESS",
      "RESOLVED"
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`
      });
    }

    if (!checkSupabaseConfigured(res)) return;

    const { data, error } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase Error:", error);
      return res.status(404).json({
        success: false,
        message: "Failed to update report or report not found"
      });
    }

    res.json({
      success: true,
      message: "Report status updated",
      report: data
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/*
  DELETE REPORT BY ID (ADMIN OR OWNER)
  DELETE /api/reports/:id
*/
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!checkSupabaseConfigured(res)) return;

    // Check ownership or admin status
    const { data: existingReport, error: fetchErr } = await supabase
      .from("reports")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !existingReport) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check profile for admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();

    const isAdmin = (profile && profile.role === "admin") || (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === req.user.email.toLowerCase());
    const isOwner = existingReport.user_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this report"
      });
    }

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete report"
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;