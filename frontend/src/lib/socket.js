import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

// Lazily creates a single shared socket connection, authenticated with
// the same JWT used for REST calls (see backend/config/socket.js).
export const getSocket = () => {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem("recstacy_token");

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
