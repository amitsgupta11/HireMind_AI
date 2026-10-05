const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.id);
  res.status(200).json({ success: true, data: { user } });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  res.status(200).json({ success: true, data: result });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json({ success: true, data: result });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

module.exports = { register, login, me, forgotPassword, resetPassword, changePassword };
