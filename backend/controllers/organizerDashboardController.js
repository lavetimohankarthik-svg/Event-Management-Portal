const organizerDashboardService =
    require("../services/organizerDashboardService");

const getDashboard = async (req, res) => {

    try {

        const dashboard =
            await organizerDashboardService.getDashboard(
                req.user._id
            );

        res.json({

            success: true,

            dashboard

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const getOrganizerEventDetails =
    async (req, res) => {

        try {

            const result =

                await organizerDashboardService

                    .getOrganizerEventDetails(

                        req.params.eventId

                    );

            res.json({

                success: true,

                result

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
    getDashboard,
    getOrganizerEventDetails
};