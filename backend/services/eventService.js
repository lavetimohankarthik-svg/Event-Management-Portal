const Event = require("../models/Event");
const User = require("../models/User");

const createEvent = async (eventData, organizerId) => {
    const event = await Event.create({
        ...eventData,
        organizer: organizerId,
    });

    return event;
};

const getAllEvents = async (filters) => {

    const query = {};

    if (filters.search) {

        query.eventName = {
            $regex: filters.search,
            $options: "i"
        };

    }

    if (filters.eventType) {

        query.eventType = filters.eventCategory;

    }

    if (filters.eligibility) {

        query.eligibility = filters.eligibility;

    }

    if (filters.startDate || filters.endDate) {

        query.startDate = {};

        if (filters.startDate) {

            query.startDate.$gte = new Date(filters.startDate);

        }

        if (filters.endDate) {

            query.startDate.$lte = new Date(filters.endDate);

        }

    }

    const events = await Event.find(query)
        .populate({
            path: "organizer",
            select: "firstName lastName",
            match: { isActive: true }
        })
        .sort({ startDate: 1 });

    return events.filter((event) => event.organizer);

};

// For Single Event
const getSingleEvent = async (id) => {
    const event = await Event.findById(id).populate({
        path: "organizer",
        select: "firstName lastName email",
        match: { isActive: true }
    });

    if (!event || !event.organizer) {
        throw new Error("Event not found");
    }

    return event;
};

//Update Event
const updateEvent = async (eventId, data, organizerId) => {

    const event = await Event.findById(eventId);

    if (!event)
        throw new Error("Event not found");

    if (String(event.organizer) !== String(organizerId))
        throw new Error("Unauthorized");

    if (event.endDate && new Date() > new Date(event.endDate)) {
        throw new Error("Cannot edit an event after it has ended.");
    }

    // Draft -> everything can be edited
    if (event.status === "draft") {

        Object.assign(event, data);

    }

    // Published -> only selected fields
    else if (event.status === "published") {

        if (data.description !== undefined)
            event.description = data.description;

        if (data.endDate !== undefined)
            event.endDate = data.endDate;

        if (data.registrationDeadline !== undefined)
            event.registrationDeadline = data.registrationDeadline;

        if (data.registrationLimit !== undefined)
            event.registrationLimit = data.registrationLimit;

        if (data.status === "closed" || data.status === "cancelled")
            event.status = "cancelled";

    }

    // Ongoing / Completed
    else if (
        event.status === "ongoing" ||
        event.status === "completed"
    ) {

        if (
            data.status &&
            ["completed", "closed"].includes(data.status)
        ) {

            event.status = data.status;

        } else {

            throw new Error(
                "Editing is not allowed for ongoing/completed events."
            );

        }

    }

    await event.save();

    return event;

};

// For Trending Events display(Top 5/24H)
const Registration = require("../models/Registration");

const getTrendingEvents = async () => {
    const registrations = await Registration.find();
    const eventCount = {};
    registrations.forEach((registration) => {
        const eventId = registration.event.toString();
        eventCount[eventId] = (eventCount[eventId] || 0) + 1;
    });

    const sortedEventIds = Object.entries(eventCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(item => item[0]);

    const today = new Date();

    const events = await Event.find({
        _id: { $in: sortedEventIds },
        $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: today } }
        ]
    }).populate({
        path: "organizer",
        select: "firstName lastName",
        match: { isActive: true }
    });

    return events.filter((event) => event.organizer);
};

const getRecommendedEvents = async (userId) => {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    const events = await Event.find()
        .populate({
            path: "organizer",
            match: { isActive: true }
        });

    const activeEvents = events.filter((event) => event.organizer);

    const recommendations = activeEvents.sort((a, b) => {

        let scoreA = 0;
        let scoreB = 0;

        // Interest Match
        if (
            user.interests?.some(
                interest => a.eventTags.includes(interest)
            )
        ) {
            scoreA += 5;
        }

        if (
            user.interests?.some(
                interest => b.eventTags.includes(interest)
            )
        ) {
            scoreB += 5;
        }

        // Followed Organizer
        if (
            user.followedOrganizers?.some(
                organizer => organizer.toString() === a.organizer._id.toString()
            )
        ) {
            scoreA += 10;
        }

        if (
            user.followedOrganizers?.some(
                organizer => organizer.toString() === b.organizer._id.toString()
            )
        ) {
            scoreB += 10;
        }

        return scoreB - scoreA;

    });

    return recommendations;

};

module.exports = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    getTrendingEvents,
    getRecommendedEvents
};