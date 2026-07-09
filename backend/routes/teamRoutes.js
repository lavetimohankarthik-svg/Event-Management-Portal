const express = require("express");

const router = express.Router();

const teamController = require("../controllers/teamController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  authorize("participant"),
  teamController.createTeam
);

router.get("/", teamController.getTeams);

router.delete(
    "/:id",
    protect,
    authorize("participant"),
    teamController.deleteTeam
);

module.exports = router;