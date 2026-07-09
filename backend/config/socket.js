const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Team = require("../models/Team");
const chatService = require("../services/chatService");

// Tracks which users are currently online, per team room, purely in
// memory (fine for a single-instance deployment).
const onlineByTeam = new Map(); // teamId -> Set of userId

const addOnline = (teamId, userId) => {
  if (!onlineByTeam.has(teamId)) onlineByTeam.set(teamId, new Set());
  onlineByTeam.get(teamId).add(String(userId));
};

const removeOnline = (teamId, userId) => {
  onlineByTeam.get(teamId)?.delete(String(userId));
};

const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authenticate every socket connection using the same JWT used by
  // the REST API (sent as `auth: { token }` from the client).
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Join a team's chat room after verifying membership
    socket.on("chat:join", async (teamId) => {
      try {
        await chatService.assertMembership(teamId, socket.user._id);

        socket.join(`team:${teamId}`);
        socket.data.teamId = teamId;

        addOnline(teamId, socket.user._id);

        io.to(`team:${teamId}`).emit("chat:online", {
          teamId,
          online: Array.from(onlineByTeam.get(teamId) || []),
        });
      } catch (error) {
        socket.emit("chat:error", error.message);
      }
    });

    // Send a message; persists to Mongo then broadcasts to the room
    socket.on("chat:send", async ({ teamId, content, attachment }) => {
      try {
        const message = await chatService.createMessage(
          teamId,
          socket.user._id,
          content,
          attachment
        );

        io.to(`team:${teamId}`).emit("chat:message", message);
      } catch (error) {
        socket.emit("chat:error", error.message);
      }
    });

    // Typing indicators
    socket.on("chat:typing", ({ teamId }) => {
      socket.to(`team:${teamId}`).emit("chat:typing", {
        userId: socket.user._id,
        name: `${socket.user.firstName} ${socket.user.lastName}`,
      });
    });

    socket.on("chat:stopTyping", ({ teamId }) => {
      socket.to(`team:${teamId}`).emit("chat:stopTyping", {
        userId: socket.user._id,
      });
    });

    socket.on("disconnect", () => {
      const teamId = socket.data.teamId;

      if (teamId) {
        removeOnline(teamId, socket.user._id);

        io.to(`team:${teamId}`).emit("chat:online", {
          teamId,
          online: Array.from(onlineByTeam.get(teamId) || []),
        });
      }
    });
  });

  // Make io reachable from controllers via req.app.get("io")
  app.set("io", io);

  return io;
};

module.exports = initSocket;
