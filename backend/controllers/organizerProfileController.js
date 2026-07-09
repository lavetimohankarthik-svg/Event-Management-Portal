const organizerProfileService =
    require("../services/organizerProfileService");

const updateProfile = async (req, res) => {

    try {

        const organizer =
            await organizerProfileService.updateProfile(

                req.user._id,

                req.body

            );

        res.json({

            success: true,

            organizer

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const getProfile = async (req, res) => {

    try {

        const organizer =
            await organizerProfileService.getProfile(

                req.user._id

            );

        res.json({

            success: true,

            organizer

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const getAllOrganizers = async (req, res) => {

    try {

        const organizers =

            await organizerProfileService.getAllOrganizers();

        res.json({

            success: true,

            organizers

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getOrganizerDetails = async (req, res) => {

    try {

        const result =

            await organizerProfileService.getOrganizerDetails(

                req.params.organizerId

            );

        res.json({

            success: true,

            result

        });

    }

    catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};

const followOrganizer = async (req, res) => {

    try {

        await organizerProfileService.followOrganizer(

            req.user.id,

            req.params.organizerId

        );

        res.json({

            success: true,

            message: "Organizer Followed"

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const unfollowOrganizer = async (req, res) => {

    try {

        await organizerProfileService.unfollowOrganizer(

            req.user.id,

            req.params.organizerId

        );

        res.json({

            success: true,

            message: "Organizer Unfollowed"

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

    updateProfile,
    getProfile,
    getAllOrganizers,
    getOrganizerDetails,
    followOrganizer,
    unfollowOrganizer

};