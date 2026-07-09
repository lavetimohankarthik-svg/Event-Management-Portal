const calendarService = require("../services/calendarService");

const downloadCalendar =
    async (req, res) => {

        try {

            const calendar =
                await calendarService.downloadCalendar(

                    req.params.eventId

                );

            res.setHeader(

                "Content-Type",

                "text/calendar"

            );

            res.setHeader(

                "Content-Disposition",

                `attachment; filename=event.ics`

            );

            res.status(200);

            res.set({
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": 'attachment; filename="event.ics"',
                "Content-Length": Buffer.byteLength(calendar)
            });

            res.end(calendar);

        }

        catch (error) {

            res.status(400).json({

                success: false,

                message: error.message

            });

        }

    };

const getCalendarLinks = async (req, res) => {

    try {

        const Event = require("../models/Event");

        const event = await Event.findById(req.params.id);

        if (!event) {

            return res.status(404).json({

                success: false,

                message: "Event not found"

            });

        }

        const links =
            calendarService.generateCalendarLinks(event);

        res.json({

            success: true,

            ...links

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

    downloadCalendar,
    getCalendarLinks

};