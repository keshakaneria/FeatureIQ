import "dotenv/config";
import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/products.js";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// API routes
app.use("/api", productRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 FeatureIQ API running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? "Neon Postgres connected" : "⚠️  DATABASE_URL not set!"}`);
});
