const express=require("express");

const router=express.Router();

const exportController=
require("../controllers/exportController");

const {
protect,
authorize
}=require("../middleware/authMiddleware");

router.get(

"/participants/:eventId",

protect,

authorize("organizer"),

exportController.exportParticipants

);

module.exports=router;