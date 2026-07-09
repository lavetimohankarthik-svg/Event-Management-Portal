const express=require("express");

const router=express.Router();

const notificationController=
require("../controllers/notificationController");

const {
protect,
authorize
}=require("../middleware/authMiddleware");

router.post(
"/",
protect,
authorize("organizer"),
notificationController.createNotification
);

router.get(
"/",
protect,
notificationController.getNotifications
);

module.exports=router;