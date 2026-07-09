const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const Registration = require("../models/Registration");
const emailService = require("./emailService");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

const registerForEvent = async (userId, eventId, formResponses = []) => {

    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    const user = await User.findById(userId);

    if (
        event.eligibility === "NIT_DURGAPUR_ONLY" &&
        user.participantType !== process.env.INSTITUTE_NAME
    ) {
        throw new Error(
            "Only NIT Durgapur students can register."
        );
    }

    if (
        event.eligibility === "EXTERNAL_ONLY" &&
        user.participantType !== "EXTERNAL"
    ) {
        throw new Error(
            "Only external participants can register."
        );
    }

    if (event.registrationType === "team") {
        throw new Error(
            "This is a team event. Register through a team."
        );
    }

    if (!event.formLocked) {

        event.formLocked = true;

        await event.save();

    }

    const alreadyRegistered =
        await Registration.findOne({

            participant: userId,

            event: eventId

        });

    if (alreadyRegistered)
        throw new Error("Already Registered");

    const ticketId = uuidv4();

    const qrCode = await QRCode.toDataURL(ticketId);

    // Determine payment and registration status based on event fee
    const isPaidEvent = !!(event.registrationFee && Number(event.registrationFee) > 0);
    const paymentStatus = isPaidEvent ? "pending" : "paid";
    const registrationStatus = isPaidEvent ? "pending" : "confirmed";

    const registration = await Registration.create({
        participant: userId,
        event: eventId,
        ticketId,
        qrCode,
        paymentStatus,
        registrationStatus,
        formResponses: Array.isArray(formResponses) ? formResponses : [],
    });

    // Organizer Notification

    await Notification.create({

        title: "New Event Registration",

        message:
            `${user.firstName} ${user.lastName} registered for ${event.eventName}.`,

        sender: user._id,

        event: event._id,

        targetAudience: "ORGANIZER"

    });

    // Participant Notification
    if (paymentStatus === "paid") {
        await Notification.create({
            title: "Registration Successful",
            message: `You have successfully registered for ${event.eventName}.`,
            sender: user._id,
            event: event._id,
            targetAudience: "PARTICIPANT",
        });

        // send ticket email for confirmed registrations
        await emailService.sendTicketEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            event,
            registration.ticketId
        );
    } else {
        await Notification.create({
            title: "Registration Pending",
            message: `Your registration for ${event.eventName} is pending payment/approval.`,
            sender: user._id,
            event: event._id,
            targetAudience: "PARTICIPANT",
        });
    }

    return registration;

};

const approveRegistration = async (registrationId, organizerId) => {
    const registration = await Registration.findById(registrationId)
        .populate("participant")
        .populate("event");

    if (!registration) throw new Error("Registration not found");

    // ensure the organizer owns the event
    if (!registration.event || String(registration.event.organizer) !== String(organizerId)) {
        throw new Error("Unauthorized");
    }

    registration.paymentStatus = "paid";
    registration.registrationStatus = "confirmed";

    // ensure ticket exists
    if (!registration.ticketId) {
        const ticketId = uuidv4();
        registration.ticketId = ticketId;
        registration.qrCode = await QRCode.toDataURL(ticketId);
    }

    await registration.save();

    // notify participant
    await Notification.create({
        title: "Payment Confirmed",
        message: `Your registration for ${registration.event.eventName} has been confirmed.`,
        sender: organizerId,
        event: registration.event._id,
        targetAudience: "PARTICIPANT",
    });

    // email ticket to participant if email exists
    if (registration.participant?.email) {
        await emailService.sendTicketEmail(
            registration.participant.email,
            `${registration.participant.firstName} ${registration.participant.lastName}`,
            registration.event,
            registration.ticketId
        );
    }

    return registration;
};

module.exports = {

    registerForEvent,

    approveRegistration

};