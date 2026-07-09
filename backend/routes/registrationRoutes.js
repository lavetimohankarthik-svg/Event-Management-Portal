const express=require("express");

const router=express.Router();

const registrationController=
require("../controllers/registrationController");

const {
    protect,
    authorize
}=require("../middleware/authMiddleware");

router.post(
    "/:eventId",
    protect,
    authorize("participant"),
    registrationController.register
);

router.put(
    "/approve/:id",
    protect,
    authorize("organizer"),
    registrationController.approve
);

module.exports=router;