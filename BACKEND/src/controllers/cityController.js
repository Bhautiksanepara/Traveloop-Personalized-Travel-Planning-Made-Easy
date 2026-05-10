const cityService = require("../services/cityService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/appError");

const listCities = catchAsync(async (req, res) => {
  const result = await cityService.listCities(req.query);
  return sendSuccess(res, 200, "Cities fetched successfully.", result.items, result.meta);
});

const getCity = catchAsync(async (req, res) => {
  const city = await cityService.getCityById(req.params.id);

  if (!city) {
    throw new AppError(404, "City not found.");
  }

  return sendSuccess(res, 200, "City fetched successfully.", city);
});

const getCityActivities = catchAsync(async (req, res) => {
  const result = await cityService.getCityActivities(req.params.id, req.query);
  return sendSuccess(res, 200, "City activities fetched successfully.", result.items, result.meta);
});

module.exports = {
  listCities,
  getCity,
  getCityActivities
};
