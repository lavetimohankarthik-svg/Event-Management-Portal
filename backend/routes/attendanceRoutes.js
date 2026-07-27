const express = require("express");

const router = express.Router();

console.log("Attendance Routes Loaded");

const attendanceController =
require("../controllers/attendanceController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.post(
    "/scan",
    protect,
    authorize("organizer"),
    attendanceController.markAttendance
);

router.get(
    "/event/:eventId",
    protect,
    authorize("organizer"),
    attendanceController.getAttendance
);

router.put(
    "/manual/:id",
    protect,
    authorize("organizer"),
    attendanceController.manualCheckIn
);

router.get(
    "/logs/:eventId",
    protect,
    authorize("organizer"),
    attendanceController.getAuditLogs
);

module.exports = router;