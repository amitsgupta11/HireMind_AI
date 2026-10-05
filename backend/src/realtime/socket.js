// Tiny registry so any service (controllers, even the notification
// service) can reach the live Socket.IO instance without importing
// server.js directly (which would create a circular require). server.js
// calls setIo() once at startup; everything else calls getIo().
let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

module.exports = { setIo, getIo };
