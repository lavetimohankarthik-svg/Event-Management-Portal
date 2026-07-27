const Merchandise = require("../models/Merchandise");

const MerchandiseOrder = require("../models/MerchandiseOrder");

const Notification = require("../models/Notification");

const User = require("../models/User");

const emailService = require("./emailService");


const createMerchandise =
    async (userId, data) => {

        return await Merchandise.create({

            name: data.name,

            description: data.description,

            price: data.price,

            stock: data.stock,

            purchaseLimitPerParticipant:
                data.purchaseLimitPerParticipant,

            purchaseDeadline:
                data.purchaseDeadline || null,

            image: data.image,

            organizer: userId

        });

    };

const getMerchandise =
    async (user) => {

        if (user.role === "organizer") {
            return await Merchandise.find({ organizer: user._id });
        }

        const merchandise = await Merchandise.find()
            .populate({
                path: "organizer",
                select: "firstName lastName",
                match: { isActive: true }
            });

        return merchandise.filter((item) => item.organizer);

    };

const placeOrder =
    async (userId, data) => {

        const merchandise =
            await Merchandise.findById(

                data.merchandiseId

            );

        if (!merchandise)
            throw new Error("Merchandise not found");

        if (merchandise.stock < data.quantity)
            throw new Error("Insufficient Stock");

        if (merchandise.purchaseDeadline && new Date() > new Date(merchandise.purchaseDeadline))
            throw new Error("Purchase deadline has passed for this merchandise.");

        const previousOrders = await MerchandiseOrder.find({

            merchandise: merchandise._id,

            participant: userId,

            paymentStatus: { $ne: "Rejected" }

        });

        const totalPurchased = previousOrders.reduce(

            (sum, order) => sum + order.quantity,

            0

        );

        if (

            totalPurchased + data.quantity >

            merchandise.purchaseLimitPerParticipant

        ) {

            throw new Error(

                "Purchase limit exceeded for this merchandise."

            );

        }

        const order =
            await MerchandiseOrder.create({

                merchandise: merchandise._id,

                participant: userId,

                quantity: data.quantity,

                totalPrice:
                    merchandise.price * data.quantity,

                paymentScreenshot:
                    data.paymentScreenshot

            });

        const user =
            await User.findById(userId);

        await Notification.create({

            title: "New Merchandise Order",

            message:
                `${user.firstName} ${user.lastName} placed an order for ${merchandise.name}.`,

            sender: user._id,

            targetAudience: "ORGANIZER"

        });

        await Notification.create({

            title: "Order Placed",

            message:
                `Your order for ${merchandise.name} has been placed and is awaiting organizer approval.`,

            sender: user._id,

            targetAudience: "PARTICIPANT"

        });

        return order;

    };

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const approveOrder =
    async (orderId) => {

        const order =
            await MerchandiseOrder.findById(orderId)

                .populate("merchandise")

                .populate("participant");

        if (!order)
            throw new Error("Order not found");

        order.paymentStatus = "Approved";

        order.ticketId = uuidv4();

        order.qrCode = await QRCode.toDataURL(order.ticketId);

        await order.save();

        order.merchandise.stock -=
            order.quantity;

        await order.merchandise.save();

        await Notification.create({

            title: "Order Approved",

            message:
                `Your order for ${order.merchandise.name} has been approved.`,

            sender: order.participant._id,

            targetAudience: "PARTICIPANT"

        });

        await emailService.sendMerchandiseOrderEmail(

            order.participant.email,

            `${order.participant.firstName} ${order.participant.lastName}`,

            order.merchandise,

            order.quantity,

            order.totalPrice,

            order.ticketId

        );


        return order;

    };

const getMyOrders =
    async (userId) => {

        return await MerchandiseOrder.find({ participant: userId })
            .populate("merchandise")
            .sort({ createdAt: -1 });

    };

const getOrdersForOrganizer =
    async (organizerId) => {

        const items = await Merchandise.find({ organizer: organizerId });
        const itemIds = items.map((i) => i._id);

        return await MerchandiseOrder.find({ merchandise: { $in: itemIds } })
            .populate("merchandise")
            .populate("participant", "firstName lastName email")
            .sort({ createdAt: -1 });

    };

module.exports = {

    createMerchandise,

    getMerchandise,

    placeOrder,

    approveOrder,

    getMyOrders,

    getOrdersForOrganizer

};