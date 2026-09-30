const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper function to validate if a string is a valid HTTP/HTTPS URL
function isValidHttpUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Verify that credentials exist, are valid HTTP/HTTPS URLs, and are not placeholder values
const isConfigured =
  isValidHttpUrl(supabaseUrl) &&
  !supabaseUrl.includes("<actual-project-id>") &&
  !supabaseUrl.includes("YOUR_SUPABASE_URL") &&
  supabaseServiceRoleKey &&
  supabaseServiceRoleKey !== "YOUR_SUPABASE_SERVICE_ROLE_KEY" &&
  !supabaseServiceRoleKey.includes("<actual-secret-key>");

let supabase = null;

if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn("⚠️  [Supabase Warning]: Missing or placeholder Supabase credentials in .env");
  console.warn("   Please update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env with your actual Supabase credentials.");
}

module.exports = supabase;