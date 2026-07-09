const merchandiseService =
require("../services/merchandiseService");

const createMerchandise = async (req, res) => {

    try {

        const merchandise =
        await merchandiseService.createMerchandise(
            req.user._id,
            req.body
        );

        res.status(201).json({
            success: true,
            merchandise
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const getMerchandise = async (req, res) => {

    try {

        const merchandise =
        await merchandiseService.getMerchandise(req.user);

        res.json({
            success: true,
            merchandise
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const placeOrder = async (req, res) => {

    try {

        const order =
        await merchandiseService.placeOrder(
            req.user._id,
            req.body
        );

        res.status(201).json({
            success: true,
            order
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const approveOrder = async (req, res) => {

    try {

        const order =
        await merchandiseService.approveOrder(
            req.params.id
        );

        res.json({
            success: true,
            order
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const getMyOrders = async (req, res) => {

    try {

        const orders =
        await merchandiseService.getMyOrders(req.user._id);

        res.json({
            success: true,
            orders
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const getOrdersForOrganizer = async (req, res) => {

    try {

        const orders =
        await merchandiseService.getOrdersForOrganizer(req.user._id);

        res.json({
            success: true,
            orders
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {

    createMerchandise,

    getMerchandise,

    placeOrder,

    approveOrder,

    getMyOrders,

    getOrdersForOrganizer

};