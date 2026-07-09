const Team = require("../models/Team");
const Event = require("../models/Event");

const createTeam = async (userId, data) => {
    const event = await Event.findById(data.event);

    if (!event) {
        throw new Error("Event not found");
    }

    if (event.registrationType !== "team") {
        throw new Error("This event allows only individual registrations.");
    }

    const team = await Team.create({
        teamName: data.teamName,
        leader: userId,
        members: [userId],
        event: data.event,
        maxMembers: data.maxMembers || 4,
    });

    return team;
};

const getTeams = async () => {
    return await Team.find()
        .populate("leader", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("event", "eventName");
};

const deleteTeam = async (teamId, userId) => {

    const team = await Team.findById(teamId);

    if (!team)
        throw new Error("Team not found");

    if (team.leader.toString() !== userId.toString())
        throw new Error("Only leader can delete team");

    if (team.isRegistered)
        throw new Error(
            "Registered team cannot be deleted."
        );

    await team.deleteOne();

    return true;

};

module.exports = {
    createTeam,
    getTeams,
    deleteTeam,
};