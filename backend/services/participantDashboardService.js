const User = require("../models/User");
const Registration = require("../models/Registration");
const Team = require("../models/Team");
const Notification = require("../models/Notification");
const Event = require("../models/Event");

const getDashboard = async (userId) => {

    const participant =
        await User.findById(userId)
        .select("-password");

    const registrations =
        await Registration.find({
            participant: userId
        })
        .populate({
        path: "event",
        populate: {
            path: "organizer",
            select: "firstName lastName"
        }
    });

    const teams =
        await Team.find({
            members: userId
        })
        .populate("event");

    const notifications =
        await Notification.find()
        .sort({createdAt:-1})
        .limit(10);

    const upcomingEvents =
        await Event.find({
            startDate:{
                $gte:new Date()
            }
        });

    return {

        participant,

        registrations,

        teams,

        notifications,

        upcomingEvents

    };

};

module.exports = {
    getDashboard
};