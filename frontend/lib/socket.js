import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
let socket = null;

// One shared socket connection for the whole app, authenticated with the
// same JWT used for API calls — the server (src/server.js) uses it to put
// this connection in a private room so notifications only ever reach the
// signed-in user they're actually for.
export function getSocket(token) {
  if (socket) return socket;
  socket = io(SOCKET_URL, { auth: { token }, autoConnect: true });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
