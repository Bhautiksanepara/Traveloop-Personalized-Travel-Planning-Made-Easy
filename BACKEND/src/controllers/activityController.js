const activityService = require("../services/activityService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/appError");

const listActivities = catchAsync(async (req, res) => {
  const result = await activityService.listActivities(req.query);
  return sendSuccess(res, 200, "Activities fetched successfully.", result.items, result.meta);
});

const getActivity = catchAsync(async (req, res) => {
  const activity = await activityService.getActivityById(req.params.id);

  if (!activity) {
    throw new AppError(404, "Activity not found.");
  }

  return sendSuccess(res, 200, "Activity fetched successfully.", activity);
});

module.exports = {
  listActivities,
  getActivity
};
