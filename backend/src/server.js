require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");
const locationRouter = require("./routes/location");
const adminRouter = require("./routes/admin");

const app = express();

// CORS configuration for local development and single-origin deployment
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/location", locationRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/hazards", reportsRouter); // Alias for backwards compatibility

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Road Reality API is running 🚗",
    version: "1.0.0"
  });
});

// Serve frontend static files from root /dist directory or backend/public
const rootDistPath = path.resolve(__dirname, "../../dist");
const backendPublicPath = path.resolve(__dirname, "../public");
const staticPath = fs.existsSync(rootDistPath) ? rootDistPath : (fs.existsSync(backendPublicPath) ? backendPublicPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
}

// SPA Fallback Route: Catch-all handler for HTML5 client-side routing
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found"
    });
  }

  if (staticPath && fs.existsSync(path.join(staticPath, "index.html"))) {
    res.sendFile(path.join(staticPath, "index.html"));
  } else {
    res.json({
      message: "Road Reality Backend is running 🚗 (Frontend build not found)",
      version: "1.0.0"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Road Reality server running on http://0.0.0.0:${PORT}`);
});