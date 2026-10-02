const express = require("express");
const supabase = require("../supabase");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper to check database configuration
const checkSupabaseConfigured = (res) => {
  if (!supabase) {
    res.status(503).json({
      success: false,
      message: "Database connection unavailable."
    });
    return false;
  }
  return true;
};

/*
  ADMIN DASHBOARD OVERVIEW STATISTICS
  GET /api/admin/stats
*/
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    if (!checkSupabaseConfigured(res)) return;

    // 1. Total Users Count
    const { count: totalUsers, error: usersErr } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersErr) console.warn("Error fetching user count:", usersErr);

    // 2. Hazard Reports Statistics
    const { data: reports, error: reportsErr } = await supabase
      .from("reports")
      .select("status");

    if (reportsErr) {
      console.error("Error fetching reports for stats:", reportsErr);
      return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }

    const totalReports = reports ? reports.length : 0;
    const reported = reports ? reports.filter(r => r.status === "REPORTED").length : 0;
    const verified = reports ? reports.filter(r => r.status === "VERIFIED").length : 0;
    const inProgress = reports ? reports.filter(r => r.status === "IN_PROGRESS").length : 0;
    const resolved = reports ? reports.filter(r => r.status === "RESOLVED").length : 0;

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalReports,
        activeReports: reported + verified + inProgress,
        resolvedReports: resolved,
        awaitingVerification: reported
      }
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
  LIST ALL REGISTERED USERS WITH REPORT COUNTS
  GET /api/admin/users
*/
router.get("/users", requireAdmin, async (req, res) => {
  try {
    if (!checkSupabaseConfigured(res)) return;

    // Fetch all profiles
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesErr) {
      console.error("Error fetching profiles:", profilesErr);
      return res.status(500).json({ success: false, message: "Failed to fetch registered users" });
    }

    // Fetch all reports to aggregate report counts per user
    const { data: reports } = await supabase
      .from("reports")
      .select("user_id");

    const reportCountMap = {};
    if (reports) {
      reports.forEach(r => {
        if (r.user_id) {
          reportCountMap[r.user_id] = (reportCountMap[r.user_id] || 0) + 1;
        }
      });
    }

    const formattedUsers = (profiles || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.full_name || p.name || p.email.split("@")[0],
      full_name: p.full_name || p.name || p.email.split("@")[0],
      avatar_url: p.avatar_url || "",
      role: p.role || "user",
      created_at: p.created_at || new Date().toISOString(),
      reportCount: reportCountMap[p.id] || 0
    }));

    res.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    });
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
  PROMOTE OR DEMOTE USER ROLE (ADMIN ONLY)
  POST /api/admin/users/:id/role
  Body: { role: "admin" | "user" }
*/
router.post("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'admin' or 'user'."
      });
    }

    if (!checkSupabaseConfigured(res)) return;

    // Check target user profile
    const { data: targetProfile, error: targetErr } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (targetErr || !targetProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found."
      });
    }

    // Protection rule: Prevent demoting the last remaining admin
    if (targetProfile.role === "admin" && role === "user") {
      const { data: adminProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (adminProfiles && adminProfiles.length <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot remove admin privileges from the last remaining administrator."
        });
      }
    }

    // Update role using backend service-role privileges
    const { data: updated, error: updateErr } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Role update error:", updateErr);
      return res.status(500).json({
        success: false,
        message: "Failed to update user role."
      });
    }

    res.json({
      success: true,
      message: `User role successfully updated to '${role}'`,
      user: updated
    });
  } catch (err) {
    console.error("Admin role change error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
