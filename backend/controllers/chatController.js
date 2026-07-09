const chatService = require("../services/chatService");

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessages(
      req.params.teamId,
      req.user._id
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await chatService.createMessage(
      req.params.teamId,
      req.user._id,
      req.body.content,
      req.body.attachment
    );

    // If a socket.io instance is attached to the app, broadcast the
    // message in real time to everyone in the team's room too.
    const io = req.app.get("io");
    if (io) {
      io.to(`team:${req.params.teamId}`).emit("chat:message", message);
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
