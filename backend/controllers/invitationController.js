const invitationService = require("../services/invitationService");

const sendInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.sendInvitation(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await invitationService.getMyInvitations(
      req.user._id
    );

    res.json({
      success: true,
      invitations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.acceptInvitation(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: "Invitation Accepted",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.rejectInvitation(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: "Invitation Rejected",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
};