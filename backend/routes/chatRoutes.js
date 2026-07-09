const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

// Message history for a team's chat room
router.get("/:teamId/messages", protect, chatController.getMessages);

// Fallback REST send (real-time delivery happens over socket.io,
// this also works for clients that aren't connected via socket)
router.post("/:teamId/messages", protect, chatController.sendMessage);

module.exports = router;
