const Event = require("../models/Event");
const User = require("../models/User");

const globalSearch = async (query) => {

    const searchRegex = new RegExp(query, "i");

    const events = await Event.find({
        eventName: searchRegex
    }).select(
        "eventName eventType startDate venue registrationType"
    );

    const organizers = await User.find({
        role: "organizer",
        $or: [
            { firstName: searchRegex },
            { lastName: searchRegex }
        ]
    }).select(
        "firstName lastName email profileImage"
    );

    return {

        events,

        organizers

    };

};

module.exports = {

    globalSearch

};