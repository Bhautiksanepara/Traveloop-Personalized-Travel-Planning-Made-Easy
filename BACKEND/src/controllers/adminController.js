const adminService = require("../services/adminService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

const getOverview = catchAsync(async (req, res) => {
  const overview = await adminService.getOverview();
  return sendSuccess(res, 200, "Admin overview fetched successfully.", overview);
});

const listUsers = catchAsync(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  return sendSuccess(res, 200, "Users fetched successfully.", result.items, result.meta);
});

const getUser = catchAsync(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  return sendSuccess(res, 200, "User fetched successfully.", user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  return sendSuccess(res, 200, "User updated successfully.", user);
});

const listTrips = catchAsync(async (req, res) => {
  const result = await adminService.listTrips(req.query);
  return sendSuccess(res, 200, "Trips fetched successfully.", result.items, result.meta);
});

const deleteTrip = catchAsync(async (req, res) => {
  await adminService.deleteTrip(req.params.id);
  return sendSuccess(res, 200, "Trip deleted successfully.");
});

const getTopCities = catchAsync(async (req, res) => {
  const result = await adminService.topCities();
  return sendSuccess(res, 200, "Top cities fetched successfully.", result);
});

const getTopActivities = catchAsync(async (req, res) => {
  const result = await adminService.topActivities();
  return sendSuccess(res, 200, "Top activities fetched successfully.", result);
});

const getEngagement = catchAsync(async (req, res) => {
  const result = await adminService.engagement();
  return sendSuccess(res, 200, "User engagement fetched successfully.", result);
});

module.exports = {
  getOverview,
  listUsers,
  getUser,
  updateUser,
  listTrips,
  deleteTrip,
  getTopCities,
  getTopActivities,
  getEngagement
};
