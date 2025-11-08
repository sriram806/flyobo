import express from "express";
import "dotenv/config";
import { PORT } from "./config/env.js";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Server is running", port: PORT });
});

app.get("/api/v1/test", (req, res) => {
  res.json({ message: "API is accessible", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/v1/test`);
});