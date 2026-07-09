const express = require("express");

const router = express.Router();

const feedbackController =
require("../controllers/feedbackController");

const {
protect,
authorize
}=require("../middleware/authMiddleware");

router.post(
"/",
protect,
authorize("participant"),
feedbackController.submitFeedback
);

router.get(
"/:eventId",
protect,
authorize("organizer","admin"),
feedbackController.getEventFeedback
);

module.exports=router;