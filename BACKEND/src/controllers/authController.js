const authService = require("../services/authService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

const signup = catchAsync(async (req, res) => {
  const result = await authService.signup(req.body);
  return sendSuccess(res, 201, "Account created successfully.", result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, 200, "Login successful.", result);
});

const refresh = catchAsync(async (req, res) => {
  const result = await authService.refreshSession(req.body);
  return sendSuccess(res, 200, "Session refreshed successfully.", result);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body);
  return sendSuccess(res, 200, "Logged out successfully.");
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body);
  return sendSuccess(res, 200, "If the email exists, a password reset link has been sent.");
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);
  return sendSuccess(res, 200, "Password reset successfully.");
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};
