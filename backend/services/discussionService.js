const Discussion = require("../models/Discussion");
const Event = require("../models/Event");

const createDiscussion = async (userId, data) => {

    const event = await Event.findById(data.event);

    if (!event)
        throw new Error("Event not found");

    const discussion = await Discussion.create({

        event: data.event,

        author: userId,

        message: data.message

    });

    return discussion;

};

const getDiscussions = async (eventId) => {

    return await Discussion.find({
        event: eventId
    })
    .populate("author", "firstName lastName")
    .populate("replies.author", "firstName lastName")
    .sort({ createdAt: -1 });

};

const replyDiscussion = async (discussionId, userId, message) => {

    const discussion =
        await Discussion.findById(discussionId);

    if (!discussion)
        throw new Error("Discussion not found");

    discussion.replies.push({

        author: userId,

        message

    });

    await discussion.save();

    return discussion;

};

module.exports = {

    createDiscussion,

    getDiscussions,

    replyDiscussion

};