const eventService = require("../services/eventService");

const createEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(
            req.body,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Event Created Successfully",
            event,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getAllEvents(req.query);

        res.status(200).json({
            success: true,
            events,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

//For Single Event
const getSingleEvent = async (req, res) => {
    try {
        const event = await eventService.getSingleEvent(req.params.id);

        res.status(200).json({
            success: true,
            event,
        });

    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

//Update Event
const updateEvent = async (req, res) => {

    try {

        const event = await eventService.updateEvent(

            req.params.id,

            req.body,

            req.user._id

        );

        res.json({

            success: true,

            message: "Event Updated Successfully",

            event

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

//for Trending Events display(Top 5/24H)
const getTrendingEvents = async (req, res) => {

    try {

        const events =

            await eventService.getTrendingEvents();

        res.json({

            success: true,

            events

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getRecommendedEvents = async (req, res) => {

    try {

        const events = await eventService.getRecommendedEvents(
            req.user._id
        );

        res.json({

            success: true,

            events

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    getTrendingEvents,
    getRecommendedEvents
};