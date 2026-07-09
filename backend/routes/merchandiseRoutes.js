const express = require("express");

const router = express.Router();

const merchandiseController =
require("../controllers/merchandiseController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    authorize("organizer"),
    merchandiseController.createMerchandise
);

router.get(
    "/",
    protect,
    merchandiseController.getMerchandise
);

router.post(
    "/order",
    protect,
    authorize("participant"),
    merchandiseController.placeOrder
);

router.get(
    "/my-orders",
    protect,
    authorize("participant"),
    merchandiseController.getMyOrders
);

router.get(
    "/orders",
    protect,
    authorize("organizer"),
    merchandiseController.getOrdersForOrganizer
);

router.put(
    "/approve/:id",
    protect,
    authorize("organizer"),
    merchandiseController.approveOrder
);

module.exports = router;