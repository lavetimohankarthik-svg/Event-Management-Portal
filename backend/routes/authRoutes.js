const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {protect,authorize,} = require("../middleware/authMiddleware");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/me", protect, authController.getCurrentUser);

router.put("/me", protect, authController.updateProfile);

router.put("/password", protect, authController.changePassword);

// Only Participant
router.get("/participant", protect, authorize("participant"),(req, res) => {
    res.json({
      success: true,
      message: "Participant Dashboard",
    });
  }
);

// Only Organizer
router.get( "/organizer", protect, authorize("organizer"),(req, res) => {
    res.json({
      success: true,
      message: "Organizer Dashboard",
    });
  }
);

// Only Admin
router.get( "/admin", protect, authorize("admin"), (req, res) => {
    res.json({
      success: true,
      message: "Admin Dashboard",
    });
  }
);

module.exports = router;