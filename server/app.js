import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import {
  CLOUD_API_KEY,
  CLOUD_NAME,
  CLOUD_SECRET_KEY,
  PORT,
  ORIGIN,
} from "./config/env.js";
import { v2 as cloudinary } from "cloudinary";    

import "./services/scheduled.notifications.service.js";

// Routes
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

// Initialize Express app
const app = express();

// Connect to database
import connecttoDatabase from "./database/mongodb.js";
import adminRoute from "./routes/admin.route.js";
import ContactRoute from "./routes/contact.route.js";
import ReportRoute from "./routes/report.route.js";
import DestinationRouter from "./routes/destination.route.js";
connecttoDatabase();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

// ✅ Allowed Origins
const allowedOrigins = [
  "https://flyobo.com",
  "https://www.flyobo.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://flyobo.vercel.app",
  "https://admin-five-gold.vercel.app"
];

// ✅ Add any environment origin dynamically
if (ORIGIN && !allowedOrigins.includes(ORIGIN)) {
  allowedOrigins.push(ORIGIN);
}

// ✅ Apply CORS Middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));

// ✅ Root Route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Flyobo Travel</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(to bottom, #001f3f, #003366);
          overflow: hidden;
          color: #fff;
        }
        .gradient-overlay {
          position: absolute;
          top: -150px;
          left: -25%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle at center, rgba(0, 191, 255, 0.5), rgba(0, 123, 255, 0.3), transparent 70%);
          filter: blur(120px);
          z-index: 0;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 191, 255, 0.3);
          z-index: 1;
          position: relative;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          color: #00d4ff;
        }
        p {
          font-size: 1.2rem;
          margin-top: 0;
          color: #87cefa;
        }
        .icon {
          font-size: 3rem;
          margin-bottom: 10px;
          color: #00d4ff;
        }
      </style>
    </head>
    <body>
      <div class="gradient-overlay"></div>
      <div class="container">
        <div class="icon">✈️</div>
        <h1>Welcome to Flyobo Travel</h1>
        <p>Your journey begins here — explore, travel, and discover with us.</p>
        <p>The backend is running successfully.</p>
      </div>
    </body>
    </html>
  `);
});

// ✅ API Routes
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

// ✅ Serve static files (e.g., uploaded images)
app.use("/uploads", express.static("uploads"));

// ✅ Create HTTP Server & Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.locals.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});