import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import {
  CLOUD_API_KEY,
  CLOUD_NAME,
  CLOUD_SECRET_KEY,
  PORT,
  ORIGIN,
} from "./config/env.js";
import { v2 as cloudinary } from "cloudinary";
import connecttoDatabase from "./database/mongodb.js";

// Import Routes
import authRouter from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import packageRouter from "./routes/package.route.js";
import layoutRoute from "./routes/layout.route.js";
import galleryRoute from "./routes/gallery.route.js";
import notificationRoute from "./routes/notification.route.js";
import bookingsRouter from "./routes/bookings.route.js";
import uploadRouter from "./routes/upload.route.js";
import referralRoute from "./routes/referral.route.js";
import referralAdminRoute from "./routes/referral.admin.route.js";
import adminRoute from "./routes/admin.route.js";
import ContactRoute from "./routes/contact.route.js";
import ReportRoute from "./routes/report.route.js";
import DestinationRouter from "./routes/destination.route.js";

// Connect to database
connecttoDatabase();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.set("trust proxy", 1); // important for production behind proxies

// Cloudinary Config
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

// Allowed Origins for CORS
const allowedOrigins = [
  "https://flyobo.com",
  "https://www.flyobo.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://flyobo.vercel.app",
  "https://flyobo-upm1.vercel.app",
  "https://admin-five-gold.vercel.app",
  "https://admin-sriram806s-projects.vercel.app"
];

if (ORIGIN && !allowedOrigins.includes(ORIGIN)) {
  allowedOrigins.push(ORIGIN);
}

// Apply CORS Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

// Root route
app.get("/", (req, res) => {
  res.send("✅ Flyobo Travel Backend is running successfully.");
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/package", packageRouter);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/layout", layoutRoute);
app.use("/api/v1/gallery", galleryRoute);
app.use("/api/v1/bookings", bookingsRouter);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/referral", referralRoute);
app.use("/api/v1/referral-admin", referralAdminRoute);
app.use("/api/v1/contact", ContactRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/reports", ReportRoute);
app.use("/api/v1/destinations", DestinationRouter);

// Serve static files
app.use("/uploads", express.static("uploads"));

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
