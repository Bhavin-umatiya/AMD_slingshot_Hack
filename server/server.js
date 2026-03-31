// NutriAI Backend Server
// Express + Firebase Admin + Firestore + GROQ API
import "dotenv/config";
import express from "express";
import cors from "cors";

// Import routes
import aiRoutes from "./routes/aiRoutes.js";
import foodLogRoutes from "./routes/foodLogRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Import auth middleware
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// ── Health check (public) ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NutriAI API",
    timestamp: new Date().toISOString(),
  });
});

import path from "path";
import { fileURLToPath } from "url";

// Define directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Protected API Routes ───────────────────────────────────────────────
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/food-logs", authMiddleware, foodLogRoutes);
app.use("/api/goals", authMiddleware, goalRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);

// ── Static Frontend Serving (For Docker / GCP) ─────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── React Router Fallback ──────────────────────────────────────────────
// Any non-API request goes to React so frontend routing works
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── 404 handler ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ───────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start server ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NutriAI API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
