const supabase = require("../supabase");

/**
 * Middleware to extract and verify Supabase JWT token from Authorization header.
 * Attaches `req.user` if valid token is provided.
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token || !supabase) {
      req.user = null;
      return next();
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    req.user = null;
    next();
  }
}

/**
 * Middleware to require authenticated user (HTTP 401 if missing).
 */
async function requireAuth(req, res, next) {
  await authenticateToken(req, res, async () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in with Google."
      });
    }
    next();
  });
}

/**
 * Middleware to require administrator authorization (HTTP 403 if not admin).
 * Never trusts client-side admin flags. Always checks database role.
 */
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    try {
      if (!supabase) {
        return res.status(503).json({
          success: false,
          message: "Database connection unavailable"
        });
      }

      // Query profiles table for the authenticated user's role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, email, name")
        .eq("id", req.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile for admin check:", error);
      }

      // Bootstrap fallback: If process.env.ADMIN_EMAIL matches user email, allow admin
      const isAdminEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === req.user.email.toLowerCase();
      const isAdminRole = profile && profile.role === "admin";

      if (!isAdminRole && !isAdminEmail) {
        return res.status(403).json({
          success: false,
          message: "You don't have administrator access."
        });
      }

      req.userProfile = profile || { role: "admin", email: req.user.email };
      next();
    } catch (err) {
      console.error("Admin verification error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during admin verification"
      });
    }
  });
}

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin
};
