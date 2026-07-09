const express=require("express");

const router=express.Router();

const participantDashboardController=
require("../controllers/participantDashboardController");

const {
protect,
authorize
}=require("../middleware/authMiddleware");

router.get(
"/",
protect,
authorize("participant"),
participantDashboardController.getDashboard
);

module.exports=router;