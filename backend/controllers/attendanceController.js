const attendanceService =
require("../services/attendanceService");

const markAttendance = async (req, res) => {

    try {

        const registration =
        await attendanceService.markAttendance(
            req.body.ticketId
        );

        res.status(200).json({
            success: true,
            message: "Attendance Marked Successfully",
            registration
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const getAttendance = async (req, res) => {

    try {

        const result =
        await attendanceService.getAttendance(
            req.params.eventId
        );

        res.json({

            success: true,

            result

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

const manualCheckIn = async (req, res) => {

    try {

        const registration =
        await attendanceService.manualCheckIn(
            req.params.id
        );

        res.json({

            success: true,

            registration

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    markAttendance,
    getAttendance,
    manualCheckIn
};
