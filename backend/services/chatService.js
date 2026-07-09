const Message = require("../models/Message");
const Team = require("../models/Team");

// A user may only chat in a team they belong to, and only once the
// team is fully formed (registered) — matches Tier B-3's dependency
// on Tier A-1 (Hackathon Team Registration).
const assertMembership = async (teamId, userId) => {
  const team = await Team.findById(teamId);

  if (!team) throw new Error("Team not found");

  const isMember = team.members.some(
    (m) => m.toString() === userId.toString()
  );

  if (!isMember) throw new Error("You are not a member of this team.");

  return team;
};

const getMessages = async (teamId, userId) => {
  await assertMembership(teamId, userId);

  return await Message.find({ team: teamId })
    .populate("sender", "firstName lastName")
    .sort({ createdAt: 1 });
};

const createMessage = async (teamId, userId, content, attachment) => {
  await assertMembership(teamId, userId);

  if (!content && !attachment?.url) {
    throw new Error("Message cannot be empty.");
  }

  const message = await Message.create({
    team: teamId,
    sender: userId,
    content: content || "",
    attachment: attachment || undefined,
  });

  return await message.populate("sender", "firstName lastName");
};

module.exports = {
  assertMembership,
  getMessages,
  createMessage,
};
