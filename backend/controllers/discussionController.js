const discussionService =
require("../services/discussionService");

const createDiscussion =
async (req, res) => {

    try {

        const discussion =
        await discussionService.createDiscussion(

            req.user._id,

            req.body

        );

        res.status(201).json({

            success: true,

            discussion

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const getDiscussions =
async (req, res) => {

    try {

        const discussions =
        await discussionService.getDiscussions(

            req.params.eventId

        );

        res.json({

            success: true,

            discussions

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const replyDiscussion =
async (req, res) => {

    try {

        const discussion =
        await discussionService.replyDiscussion(

            req.params.id,

            req.user._id,

            req.body.message

        );

        res.json({

            success: true,

            discussion

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

    createDiscussion,

    getDiscussions,

    replyDiscussion

};