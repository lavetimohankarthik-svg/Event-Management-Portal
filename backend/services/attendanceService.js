const Registration = require("../models/Registration");
const AuditLog = require("../models/AuditLog");

const getAttendance = async (eventId) => {
    const registrations = await Registration.find({
        event: eventId
    }).populate(
        "participant",
        "firstName lastName email"
    );

    const present = registrations.filter(
        r => r.checkedIn
    ).length;

    const absent = registrations.length - present;

    return {
        totalRegistrations: registrations.length,
        present,
        absent,
        registrations
    };
};

const markAttendance = async (ticketId) => {
    const registration = await Registration.findOne({ ticketId })
        .populate("participant", "firstName lastName email")
        .populate("event");

    if (!registration) {
        throw new Error("Ticket not found");
    }

    if (registration.event && registration.event.startDate && new Date() < new Date(registration.event.startDate)) {
        throw new Error("Cannot check in participants before the event has started");
    }

    if (registration.event && registration.event.endDate && new Date() > new Date(registration.event.endDate)) {
        throw new Error("Cannot check in participants after the event has ended");
    }

    if (registration.checkedIn) {
        throw new Error("Participant already checked in");
    }

    registration.checkedIn = true;
    await registration.save();

    return registration;
};

const manualCheckIn = async (registrationId, organizerId) => {
    const registration = await Registration.findById(registrationId)
        .populate("participant", "firstName lastName email")
        .populate("event");

    if (!registration) {
        throw new Error("Registration not found");
    }

    if (registration.event && registration.event.startDate && new Date() < new Date(registration.event.startDate)) {
        throw new Error("Cannot check in participants before the event has started");
    }

    if (registration.event && registration.event.endDate && new Date() > new Date(registration.event.endDate)) {
        throw new Error("Cannot check in participants after the event has ended");
    }

    if (registration.checkedIn) {
        throw new Error("Participant already checked in");
    }

    registration.checkedIn = true;
    await registration.save();

    // Create AuditLog entry
    const details = `Checked in participant manually: ${registration.participant?.firstName} ${registration.participant?.lastName}`;
    await AuditLog.create({
        organizer: organizerId,
        registration: registration._id,
        participant: registration.participant?._id,
        action: "MANUAL_CHECKIN",
        details,
    });

    return registration;
};

const getAuditLogs = async (eventId) => {
    const registrations = await Registration.find({ event: eventId });
    const regIds = registrations.map(r => r._id);
    return await AuditLog.find({ registration: { $in: regIds } })
        .populate("organizer", "firstName lastName email")
        .populate("participant", "firstName lastName email")
        .sort({ createdAt: -1 });
};

module.exports = {
    getAttendance,
    markAttendance,
    manualCheckIn,
    getAuditLogs
};