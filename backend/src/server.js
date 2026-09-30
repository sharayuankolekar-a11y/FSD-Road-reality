require("dotenv").config();

const express = require("express");
const cors = require("cors");

const reportsRouter = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Road Reality Backend is running 🚗"
  });
});

app.use("/api/reports", reportsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Road Reality backend running on port ${PORT}`);
});