const express = require("express");
const supabase = require("../supabase");

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

/*
  CREATE A NEW ROAD HAZARD REPORT

  POST /api/reports
*/
router.post("/", async (req, res) => {
  try {
    const {
      hazard_type,
      description,
      latitude,
      longitude,
      severity,
      traffic_affected,
      photo_url
    } = req.body;

    // Input Validation: Required fields
    if (
      !hazard_type ||
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null ||
      !severity
    ) {
      return res.status(400).json({
        success: false,
        message: "Hazard type, latitude, longitude, and severity are required"
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

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          hazard_type,
          description: description || null,
          latitude: Number(latitude),
          longitude: Number(longitude),
          severity,
          traffic_affected: traffic_affected !== undefined ? traffic_affected : false,
          photo_url: photo_url || null,
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
  UPDATE REPORT STATUS

  PUT /api/reports/:id/status
*/
router.put("/:id/status", async (req, res) => {
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
      .update({ status })
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
  DELETE REPORT BY ID

  DELETE /api/reports/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!checkSupabaseConfigured(res)) return;

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