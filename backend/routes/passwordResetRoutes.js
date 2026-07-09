const express = require("express");

const router = express.Router();

const controller =
require("../controllers/passwordResetController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.post(
    "/request",
    protect,
    authorize("organizer"),
    controller.createRequest
);

router.get(
    "/",
    protect,
    authorize("admin"),
    controller.getRequests
);

router.put(
    "/approve/:id",
    protect,
    authorize("admin"),
    controller.approveRequest
);

router.put(
    "/reject/:id",
    protect,
    authorize("admin"),
    controller.rejectRequest
);

module.exports = router;