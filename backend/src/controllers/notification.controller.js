const notificationService = require("../services/notification.service");
const asyncHandler = require("../utils/asyncHandler");

const listMine = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listMyNotifications(req.user.id);
  const unread = await notificationService.unreadCount(req.user.id);
  res.status(200).json({ success: true, data: { notifications, unread } });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { notification } });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json({ success: true, data: result });
});

module.exports = { listMine, markAsRead, markAllAsRead };
