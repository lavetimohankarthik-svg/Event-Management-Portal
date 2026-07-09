const express = require("express");

const router = express.Router();

const dashboardController =
require("../controllers/organizerDashboardController");

const {
    protect,
    authorize
}=require("../middleware/authMiddleware");

router.get(
    "/",
    protect,
    authorize("organizer"),
    dashboardController.getDashboard
);

router.get(
"/event/:eventId",
protect,
authorize("organizer"),
dashboardController.getOrganizerEventDetails
);

module.exports = router;