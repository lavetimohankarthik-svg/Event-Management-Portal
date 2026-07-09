const Feedback = require("../models/Feedback");
const Registration = require("../models/Registration");

const submitFeedback = async (userId, data) => {

    const attended =
        await Registration.findOne({

            participant: userId,

            event: data.event,

            checkedIn: true

        });

    if (!attended)
        throw new Error(
            "Only attendees can submit feedback."
        );

    return await Feedback.create({

        participant: userId,

        event: data.event,

        rating: data.rating,

        feedback: data.feedback

    });

};

const getEventFeedback = async (eventId) => {

    const feedbacks =
        await Feedback.find({

            event: eventId

        }).select("-participant");

    const averageRating =
        feedbacks.length
            ? (
                feedbacks.reduce(
                    (sum, item) => sum + item.rating,
                    0
                ) / feedbacks.length
            ).toFixed(1)
            : 0;

    return {

        averageRating,

        totalFeedback: feedbacks.length,

        feedbacks

    };

};

module.exports = {

    submitFeedback,

    getEventFeedback

};