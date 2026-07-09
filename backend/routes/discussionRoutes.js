const express = require("express");

const router = express.Router();

const discussionController =
require("../controllers/discussionController");

const {
    protect
} = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    discussionController.createDiscussion
);

router.get(
    "/:eventId",
    protect,
    discussionController.getDiscussions
);

router.post(
    "/reply/:id",
    protect,
    discussionController.replyDiscussion
);

module.exports = router;