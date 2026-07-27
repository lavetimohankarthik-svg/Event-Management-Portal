const { Parser } = require("json2csv");
const Registration = require("../models/Registration");

const exportParticipants = async (eventId) => {
    const registrations = await Registration.find({
        event: eventId
    })
    .populate("participant", "firstName lastName email phoneNumber collegeName")
    .populate({
        path: "team",
        populate: {
            path: "members",
            select: "firstName lastName email phoneNumber collegeName"
        }
    });

    const data = [];

    registrations.forEach(r => {
        if (r.participant) {
            // Prepend tab (\t) to keep leading zeros and prevent scientific notation in Excel
            const phone = r.participant.phoneNumber ? `\t${r.participant.phoneNumber}` : "";
            data.push({
                FirstName: r.participant.firstName || "",
                LastName: r.participant.lastName || "",
                Email: r.participant.email || "",
                Phone: phone,
                College: r.participant.collegeName || "",
                TeamName: "N/A",
                CheckedIn: r.checkedIn ? "Yes" : "No"
            });
        } else if (r.team) {
            const teamName = r.team.teamName || "";
            (r.team.members || []).forEach(member => {
                const phone = member.phoneNumber ? `\t${member.phoneNumber}` : "";
                data.push({
                    FirstName: member.firstName || "",
                    LastName: member.lastName || "",
                    Email: member.email || "",
                    Phone: phone,
                    College: member.collegeName || "",
                    TeamName: teamName,
                    CheckedIn: r.checkedIn ? "Yes" : "No"
                });
            });
        }
    });

    const parser = new Parser();
    return parser.parse(data);
};

module.exports = {
    exportParticipants
};