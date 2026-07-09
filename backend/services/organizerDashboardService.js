const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Merchandise = require("../models/Merchandise");
const MerchandiseOrder = require("../models/MerchandiseOrder");

const getDashboard = async (organizerId) => {

    const events = await Event.find({
        organizer: organizerId
    });

    const eventIds = events.map(event => event._id);

    const registrations = await Registration.find({
        event: { $in: eventIds }
    });

    const attendance = registrations.filter(
        registration => registration.checkedIn
    ).length;

    const Merchandise = require("../models/Merchandise");

    const merchandiseItems = await Merchandise.find({
        organizer: organizerId
    });

    const merchandiseItemIds = merchandiseItems.map(item => item._id);

    const completedOrders = await MerchandiseOrder.find({
        paymentStatus: "Approved",
        merchandise: { $in: merchandiseItemIds }
    });

    const revenue = completedOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
    );

    return {
        totalEvents: events.length,

        totalRegistrations: registrations.length,

        totalAttendance: attendance,

        totalRevenue: revenue,

        totalMerchandiseSales: completedOrders.length,

        draftEvents:
            events.filter(e => e.status === "draft").length,

        publishedEvents:
            events.filter(e => e.status === "published").length,

        ongoingEvents:
            events.filter(e => e.status === "ongoing").length,

        completedEvents:
            events.filter(e => e.status === "completed").length,

        cancelledEvents:
            events.filter(e => e.status === "cancelled").length,

        events
    };

};

const getOrganizerEventDetails = async (eventId) => {

    const event =
        await Event.findById(eventId)

            .populate("organizer");

    const registrations =
        await Registration.find({

            event: eventId

        })

            .populate("participant");

    const attendance =
        registrations.filter(

            r => r.checkedIn

        ).length;

    return {

        overview: event,

        analytics: {

            registrations:

                registrations.length,

            attendance

        },

        participants:

            registrations

    };

};

module.exports = {
    getDashboard,
    getOrganizerEventDetails
};