require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profiles");
const employeeRoutes = require("./routes/employees");
const payrollRoutes = require("./routes/payroll");
const financeRoutes = require("./routes/finance");
const internBatchRoutes = require("./routes/internBatches");
const internRoutes = require("./routes/interns");
const announcementRoutes = require("./routes/announcements");
const mailRoutes = require("./routes/mail");
const publicInternshipRoutes = require("./routes/public/internships");
const internshipRoutes = require("./routes/internships");
const templateRoutes = require("./routes/templates");

// ─── App Init ──────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "https://www.ofzen.in",
        "https://ofzen.in",
      ];
      if (
        !origin ||
        allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ─── Static Files (PDFs) ───────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/intern-batches", internBatchRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/public/internships", publicInternshipRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/templates", templateRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV || "development"}`);
  });
});
