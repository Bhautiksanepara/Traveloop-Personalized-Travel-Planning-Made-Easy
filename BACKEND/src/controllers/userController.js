const userService = require("../services/userService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

const getMe = catchAsync(async (req, res) => {
  const profile = await userService.getProfile(req.user.id);
  return sendSuccess(res, 200, "Profile fetched successfully.", profile);
});

const updateMe = catchAsync(async (req, res) => {
  const profile = await userService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, 200, "Profile updated successfully.", profile);
});

const deleteMe = catchAsync(async (req, res) => {
  await userService.deleteAccount(req.user.id);
  return sendSuccess(res, 200, "Account deleted successfully.");
});

const getSavedDestinations = catchAsync(async (req, res) => {
  const result = await userService.listSavedDestinations(req.user.id, req.query);
  return sendSuccess(res, 200, "Saved destinations fetched successfully.", result.items, result.meta);
});

const addSavedDestination = catchAsync(async (req, res) => {
  const record = await userService.addSavedDestination(req.user.id, req.body.cityId);
  return sendSuccess(res, 201, "Destination saved successfully.", record);
});

const removeSavedDestination = catchAsync(async (req, res) => {
  await userService.removeSavedDestination(req.user.id, req.params.cityId);
  return sendSuccess(res, 200, "Saved destination removed successfully.");
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getSavedDestinations,
  addSavedDestination,
  removeSavedDestination
};
