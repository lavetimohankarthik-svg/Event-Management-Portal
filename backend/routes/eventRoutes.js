const express = require("express");

const router = express.Router();

const eventController = require("../controllers/eventController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Public Routes
router.get("/", eventController.getAllEvents);

// Trending Events
router.get(
"/trending",
protect,
eventController.getTrendingEvents
);

//Update Events
router.put(
    "/:id",
    protect,
    authorize("organizer"),
    eventController.updateEvent
);

router.get(
    "/recommended",
    protect,
    authorize("participant"),
    eventController.getRecommendedEvents
);

//single Events
router.get("/:id", eventController.getSingleEvent);

// Organizer Only
router.post(
  "/",
  protect,
  authorize("organizer"),
  eventController.createEvent
);

module.exports = router;