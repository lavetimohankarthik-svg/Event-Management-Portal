const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.post(
  "/create-organizer",
  protect,
  authorize("admin"),
  adminController.createOrganizer
);

router.get(
  "/organizers",
  protect,
  authorize("admin"),
  adminController.getAllOrganizers
);

router.delete(
  "/organizer/:id",
  protect,
  authorize("admin"),
  adminController.deleteOrganizer
);

router.put(
  "/organizer/:id/enable",
  protect,
  authorize("admin"),
  adminController.enableOrganizer
);

module.exports = router;