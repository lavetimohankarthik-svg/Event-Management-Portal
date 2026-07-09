const User = require("../models/User");
const Registration = require("../models/Registration");
const Team = require("../models/Team");
const Event = require("../models/Event");

const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");



const registerTeam = async (leaderId, teamId, eventId) => {


    const team = await Team.findById(teamId);

    if (!team)
        throw new Error("Team not found");

    if (team.leader.toString() !== leaderId.toString())
        throw new Error("Only leader can register team.");

    if (team.isRegistered)
        throw new Error("Team already registered.");

    const event = await Event.findById(eventId);

    if (!event)
        throw new Error("Event not found");

    if (event.registrationType !== "team")
        throw new Error("This event is not a team event.");

    if (team.members.length < event.minTeamSize)
        throw new Error("Minimum team size not satisfied.");

    if (team.members.length > event.maxTeamSize)
        throw new Error("Maximum team size exceeded.");

    for (const memberId of team.members) {

        const member =
            await User.findById(memberId);

        if (
            event.eligibility === "NIT_DURGAPUR_ONLY" &&
            member.participantType !== process.env.INSTITUTE_NAME
        ) {
            throw new Error(
                "All team members must be NIT Durgapur students."
            );
        }

        if (
            event.eligibility === "EXTERNAL_ONLY" &&
            member.participantType !== "EXTERNAL"
        ) {
            throw new Error(
                "All team members must be external participants."
            );
        }
    }

    const ticketId = uuidv4();

    const qrCode = await QRCode.toDataURL(ticketId);

    const registration = await Registration.create({

        team: team._id,

        event: event._id,

        ticketId,

        qrCode,

        paymentStatus:
            event.registrationFee === 0
                ? "free"
                : "pending"

    });

    team.isRegistered = true;

    team.registration = registration._id;

    await team.save();

    return registration;

};

module.exports = {
    registerTeam
};