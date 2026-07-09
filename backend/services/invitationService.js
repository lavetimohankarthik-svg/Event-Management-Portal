const Invitation = require("../models/Invitation");
const Team = require("../models/Team");
const User = require("../models/User");
const emailService = require("./emailService");

// Send Invitation
const sendInvitation = async (leaderId, data) => {
  const { teamId, receiverEmail } = data;

  const team = await Team.findById(teamId).populate("event").populate("leader");

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.leader._id.toString() !== leaderId.toString()) {
    throw new Error("Only the team leader can send invitations.");
  }

  const receiver = await User.findOne({ email: receiverEmail });

  if (!receiver) {
    throw new Error("Participant not found.");
  }

  // Team Leader cannot invite Himself
  if (receiver._id.toString() === leaderId.toString()) {
    throw new Error("You cannot invite yourself.");
  }
  // Team Leader Cannot invite organizer / Admin
  if (receiver.role !== "participant") {
    throw new Error(
      "Only participants can join teams."
    );
  }

  if (!team.event) {
    throw new Error("Event associated with the team was not found.");
  }

  // Prevent inviting another team leader for the same event
  const isLeaderOfAnotherTeam = await Team.findOne({
    event: team.event._id || team.event,
    leader: receiver._id
  });

  if (isLeaderOfAnotherTeam) {
    throw new Error("This participant is already a team leader for this event.");
  }

  if (
    team.members.some(
      (member) => member.toString() === receiver._id.toString()
    )
  ) {
    throw new Error("Participant is already a member.");
  }

  if (team.members.length >= team.maxMembers) {
    throw new Error("Team is full.");
  }

  const existingInvitation = await Invitation.findOne({
    team: teamId,
    receiver: receiver._id,
    status: "pending",
  });

  if (existingInvitation) {
    throw new Error("Invitation already sent.");
  }

  const invitation = await Invitation.create({
    team: teamId,
    sender: leaderId,
    receiver: receiver._id,
  });

  await emailService.sendTeamInvitationEmail(
    receiver.email,
    `${receiver.firstName} ${receiver.lastName}`,
    `${team.leader.firstName} ${team.leader.lastName}`,
    team.teamName,
    team.event.eventName
  );

  return invitation;
};

// Get My Invitations
const getMyInvitations = async (userId) => {
  return await Invitation.find({
    receiver: userId,
    status: "pending",
  })
    .populate("team", "teamName")
    .populate("sender", "firstName lastName email");
};

// Accept Invitation
const acceptInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.receiver.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  const team = await Team.findById(invitation.team);

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.members.length >= team.maxMembers) {
    throw new Error("Team is full");
  }
  //A participant can only join one team in that event
  const existingTeam = await Team.findOne({
    event: team.event,
    members: userId
  });

  if (existingTeam) {
    throw new Error(
      "You are already registered in one team in this respective event."
    );
  }

  team.members.push(userId);
  await team.save();

  invitation.status = "accepted";
  await invitation.save();

  return invitation;
};

// Reject Invitation
const rejectInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.receiver.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  invitation.status = "rejected";

  await invitation.save();

  return invitation;
};

module.exports = {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
};