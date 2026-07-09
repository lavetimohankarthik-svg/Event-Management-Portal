const express=require("express");

const router=express.Router();

const organizerProfileController=
require("../controllers/organizerProfileController");

const {
protect,
authorize
}=require("../middleware/authMiddleware");

router.get(
"/",
protect,
authorize("organizer"),
organizerProfileController.getProfile
);

router.put(
"/",
protect,
authorize("organizer"),
organizerProfileController.updateProfile
);

router.get(
"/all",
protect,
organizerProfileController.getAllOrganizers
);

router.get(
"/:organizerId",
protect,
organizerProfileController.getOrganizerDetails
);

router.post(
"/:organizerId/follow",
protect,
authorize("participant"),
organizerProfileController.followOrganizer
);

router.delete(
"/:organizerId/unfollow",
protect,
authorize("participant"),
organizerProfileController.unfollowOrganizer
);

module.exports=router;