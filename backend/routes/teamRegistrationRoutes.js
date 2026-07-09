const express = require("express");

const router = express.Router();

const {
    protect,
    authorize
}=require("../middleware/authMiddleware");

const teamRegistrationController =
require("../controllers/teamRegistrationController");

router.post(
    "/:teamId/:eventId",
    protect,
    authorize("participant"),
    teamRegistrationController.registerTeam
);

module.exports=router;