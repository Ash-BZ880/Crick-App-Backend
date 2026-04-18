const dotenv = require("dotenv");
// Load Backend/.env even when the process cwd is the repo root (e.g. `node Backend/server.js`).
dotenv.config({ path: require("node:path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes"); // NEW
const matchRoutes = require("./routes/matchRoutes");
const liveRoutes = require("./routes/LiveRoutes");
const AdminRoutes = require("./routes/setupRoutes");
const advertiseRoutes = require("./routes/advertiseRoutes");

const { ensureDefaultAdmin } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
 
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes); // NEW
app.use("/api/matches", matchRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/admin", advertiseRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect DB and initialize default admin
connectDB().then(ensureDefaultAdmin);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
