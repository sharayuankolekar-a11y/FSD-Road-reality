require("dotenv").config();

const express = require("express");
const cors = require("cors");

const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");
const locationRouter = require("./routes/location");
const adminRouter = require("./routes/admin");

const app = express();

// CORS configuration for local development and explicit allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Road Reality Backend is running 🚗",
    version: "1.0.0"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/location", locationRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/hazards", reportsRouter); // Alias for backwards compatibility

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Road Reality backend running on port ${PORT}`);
});