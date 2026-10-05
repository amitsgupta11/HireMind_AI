const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const app = require("./app");
const { port, frontendUrl, jwtSecret } = require("./config/env");
const { setIo } = require("./realtime/socket");

const server = http.createServer(app);

// Real-time layer (Phase 13). Each authenticated client joins a private
// room keyed by their own user id, so notifications only ever reach the
// person they're for — never broadcast to everyone connected.
const io = new Server(server, {
  cors: { origin: frontendUrl, credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // allow anonymous connections (e.g. landing page); they just won't join a room
    const payload = jwt.verify(token, jwtSecret);
    socket.userId = payload.sub;
    next();
  } catch (err) {
    next(); // invalid/expired token — connect anyway, just without a room
  }
});

io.on("connection", (socket) => {
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
    console.log(`[socket] client ${socket.id} joined room user:${socket.userId}`);
  } else {
    console.log(`[socket] client connected (unauthenticated): ${socket.id}`);
  }

  socket.on("disconnect", () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
  });
});

setIo(io);

server.listen(port, () => {
  console.log(`HireMind AI API running on http://localhost:${port}`);
});

module.exports = { server, io };
