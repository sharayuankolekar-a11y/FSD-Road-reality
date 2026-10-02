const express = require("express");
const supabase = require("../supabase");
const { requireAuth, authenticateToken } = require("../middleware/auth");

const router = express.Router();

/*
  GET USER PROFILE AND ROLE
  GET /api/auth/profile
*/
router.get("/profile", requireAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    // Check bootstrap admin email
    const isAdminEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === req.user.email.toLowerCase();

    if (error || !profile) {
      // Return basic user info if profile table isn't populated yet
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.user_metadata?.full_name || req.user.user_metadata?.name || req.user.email.split("@")[0],
          avatar_url: req.user.user_metadata?.avatar_url,
          role: isAdminEmail ? "admin" : "user"
        }
      });
    }

    const effectiveRole = isAdminEmail ? "admin" : (profile.role || "user");

    res.json({
      success: true,
      user: {
        ...profile,
        role: effectiveRole
      }
    });
  } catch (error) {
    console.error("Profile endpoint error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
  SYNC / ENSURE USER PROFILE IN DATABASE
  POST /api/auth/sync-profile
*/
router.post("/sync-profile", requireAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, message: "Database connection unavailable" });
    }

    const user = req.user;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0];
    const avatar_url = user.user_metadata?.avatar_url || null;
    const isAdminEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === user.email.toLowerCase();
    const role = isAdminEmail ? "admin" : "user";

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        name,
        avatar_url,
        role
      }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.warn("Profile sync warning (schema may need setup):", error.message);
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name,
          avatar_url,
          role
        }
      });
    }

    res.json({
      success: true,
      user: profile
    });
  } catch (error) {
    console.error("Sync profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
