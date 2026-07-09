const express=require("express");

const router=express.Router();

const calendarController=
require("../controllers/calendarController");

const { protect }=
require("../middleware/authMiddleware");

router.get(
"/:eventId",
protect,
calendarController.downloadCalendar
);

router.get(
    "/links/:id",
    calendarController.getCalendarLinks
);

module.exports=router;