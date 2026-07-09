const Event = require("../models/Event");

const { createEvent } = require("ics");

const downloadCalendar = async (eventId) => {

    const event = await Event.findById(eventId);

    if (!event)
        throw new Error("Event not found");

    const start = new Date(event.startDate);

    const end = new Date(event.endDate);

    const calendarEvent = {

        title: event.eventName,

        description: event.description,

        location: event.venue,

        start: [

            start.getFullYear(),

            start.getMonth() + 1,

            start.getDate(),

            start.getHours(),

            start.getMinutes()

        ],

        end: [

            end.getFullYear(),

            end.getMonth() + 1,

            end.getDate(),

            end.getHours(),

            end.getMinutes()

        ]

    };

    const { error, value } = createEvent(calendarEvent);

    if (error)
        throw error;

    return value;

};

const generateCalendarLinks = (event) => {

    const start = new Date(event.startDate)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z/, "Z");

    const end = new Date(event.endDate)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z/, "Z");

    const googleCalendar =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(event.eventName)}` +
        `&dates=${start}/${end}` +
        `&details=${encodeURIComponent(event.description)}` +
        `&location=${encodeURIComponent(event.venue)}`;

    const outlookCalendar =
        `https://outlook.live.com/calendar/0/deeplink/compose` +
        `?subject=${encodeURIComponent(event.eventName)}` +
        `&startdt=${event.startDate}` +
        `&enddt=${event.endDate}` +
        `&body=${encodeURIComponent(event.description)}` +
        `&location=${encodeURIComponent(event.venue)}`;

    return {
        googleCalendar,
        outlookCalendar
    };

};

module.exports = {
    downloadCalendar,
    generateCalendarLinks

};