const express = require("express");

const router = express.Router();

const invitationController = require("../controllers/invitationController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.post(
  "/send",
  protect,
  authorize("participant"),
  invitationController.sendInvitation
);

router.get(
  "/my",
  protect,
  authorize("participant"),
  invitationController.getMyInvitations
);

router.patch(
  "/:id/accept",
  protect,
  authorize("participant"),
  invitationController.acceptInvitation
);

router.patch(
  "/:id/reject",
  protect,
  authorize("participant"),
  invitationController.rejectInvitation
);

module.exports = router;