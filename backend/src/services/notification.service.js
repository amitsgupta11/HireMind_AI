const prisma = require("../config/prisma");

// One place that creates notifications — Phase 13 hangs real-time
// Socket.IO delivery off this exact function, so nothing about how
// notifications get created has to change when that wiring is added.
async function createNotification(userId, { type, title, message }) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message },
  });

  // Real-time push (Phase 13). getIo() returns null before the socket
  // server is attached (e.g. when called from the worker process, which
  // has no Socket.IO server of its own) — that's fine, the notification
  // still exists and shows up next time the app polls/loads.
  try {
    const { getIo } = require("../realtime/socket");
    const io = getIo();
    if (io) {
      io.to(`user:${userId}`).emit("notification:new", notification);
    }
  } catch {
    // Realtime module not available in this process (e.g. the worker) —
    // the notification is still saved, just not pushed live.
  }

  return notification;
}

async function listMyNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) return null;
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

async function markAllAsRead(userId) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { message: "All notifications marked as read" };
}

async function unreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

module.exports = { createNotification, listMyNotifications, markAsRead, markAllAsRead, unreadCount };
