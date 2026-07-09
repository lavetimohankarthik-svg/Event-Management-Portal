const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const eventRoutes = require("./routes/eventRoutes");

const adminRoutes = require("./routes/adminRoutes");

const registrationRoutes = require("./routes/registrationRoutes");

const attendanceRoutes = require("./routes/attendanceRoutes");

const teamRoutes = require("./routes/teamRoutes");

const invitationRoutes = require("./routes/invitationRoutes");

const teamRegistrationRoutes = require("./routes/teamRegistrationRoutes");

const organizerDashboardRoutes = require("./routes/organizerDashboardRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const discussionRoutes = require("./routes/discussionRoutes");

const organizerProfileRoutes = require("./routes/organizerProfileRoutes");

const participantDashboardRoutes = require("./routes/participantDashboardRoutes");

const merchandiseRoutes = require("./routes/merchandiseRoutes");

const passwordResetRoutes = require("./routes/passwordResetRoutes");

const calendarRoutes = require("./routes/calendarRoutes");

const feedbackRoutes = require("./routes/feedbackRoutes");

const uploadRoutes = require("./routes/uploadRoutes");

const exportRoutes = require("./routes/exportRoutes");

const searchRoutes = require("./routes/searchRoutes");

const chatRoutes = require("./routes/chatRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/team-registration", teamRegistrationRoutes);
app.use("/api/organizer/dashboard", organizerDashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/organizer/profile", organizerProfileRoutes);
app.use("/api/participant/dashboard", participantDashboardRoutes);
app.use("/api/merchandise", merchandiseRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);


// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Recstacy Event Management API 🚀",
  });
});

module.exports = app;