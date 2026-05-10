const tripService = require("../services/tripService");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

const listTrips = catchAsync(async (req, res) => {
  const result = await tripService.listTrips(req.user.id, req.query);
  return sendSuccess(res, 200, "Trips fetched successfully.", result.items, result.meta);
});

const createTrip = catchAsync(async (req, res) => {
  const trip = await tripService.createTrip(req.user.id, req.body);
  return sendSuccess(res, 201, "Trip created successfully.", trip);
});

const listPublicTrips = catchAsync(async (req, res) => {
  const result = await tripService.listPublicTrips(req.query);
  return sendSuccess(res, 200, "Shared trips fetched successfully.", result.items, result.meta);
});

const getTrip = catchAsync(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Trip fetched successfully.", trip);
});

const updateTrip = catchAsync(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 200, "Trip updated successfully.", trip);
});

const deleteTrip = catchAsync(async (req, res) => {
  await tripService.deleteTrip(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Trip deleted successfully.");
});

const addStop = catchAsync(async (req, res) => {
  const stop = await tripService.addStop(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 201, "Trip stop added successfully.", stop);
});

const updateStop = catchAsync(async (req, res) => {
  const stop = await tripService.updateStop(req.params.id, req.params.stopId, req.user.id, req.body);
  return sendSuccess(res, 200, "Trip stop updated successfully.", stop);
});

const deleteStop = catchAsync(async (req, res) => {
  await tripService.deleteStop(req.params.id, req.params.stopId, req.user.id);
  return sendSuccess(res, 200, "Trip stop deleted successfully.");
});

const reorderStops = catchAsync(async (req, res) => {
  await tripService.reorderStops(req.params.id, req.user.id, req.body.items);
  return sendSuccess(res, 200, "Trip stops reordered successfully.");
});

const addStopActivity = catchAsync(async (req, res) => {
  const stopActivity = await tripService.addStopActivity(req.params.id, req.params.stopId, req.user.id, req.body);
  return sendSuccess(res, 201, "Stop activity added successfully.", stopActivity);
});

const updateStopActivity = catchAsync(async (req, res) => {
  const stopActivity = await tripService.updateStopActivity(
    req.params.id,
    req.params.stopId,
    req.params.stopActivityId,
    req.user.id,
    req.body
  );
  return sendSuccess(res, 200, "Stop activity updated successfully.", stopActivity);
});

const deleteStopActivity = catchAsync(async (req, res) => {
  await tripService.deleteStopActivity(req.params.id, req.params.stopId, req.params.stopActivityId, req.user.id);
  return sendSuccess(res, 200, "Stop activity removed successfully.");
});

const reorderStopActivities = catchAsync(async (req, res) => {
  await tripService.reorderStopActivities(req.params.id, req.params.stopId, req.user.id, req.body.items);
  return sendSuccess(res, 200, "Stop activities reordered successfully.");
});

const getItinerary = catchAsync(async (req, res) => {
  const itinerary = await tripService.getItinerary(req.params.id, req.user.id, req.query);
  return sendSuccess(res, 200, "Itinerary fetched successfully.", itinerary);
});

const getBudgetSummary = catchAsync(async (req, res) => {
  const summary = await tripService.calculateBudgetSummary(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Budget summary fetched successfully.", summary);
});

const listExpenses = catchAsync(async (req, res) => {
  const expenses = await tripService.listExpenses(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Expenses fetched successfully.", expenses);
});

const createExpense = catchAsync(async (req, res) => {
  const expense = await tripService.createExpense(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 201, "Expense created successfully.", expense);
});

const updateExpense = catchAsync(async (req, res) => {
  const expense = await tripService.updateExpense(req.params.id, req.params.expenseId, req.user.id, req.body);
  return sendSuccess(res, 200, "Expense updated successfully.", expense);
});

const deleteExpense = catchAsync(async (req, res) => {
  await tripService.deleteExpense(req.params.id, req.params.expenseId, req.user.id);
  return sendSuccess(res, 200, "Expense deleted successfully.");
});

const listPackingItems = catchAsync(async (req, res) => {
  const items = await tripService.listPackingItems(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Packing items fetched successfully.", items);
});

const createPackingItem = catchAsync(async (req, res) => {
  const item = await tripService.createPackingItem(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 201, "Packing item created successfully.", item);
});

const updatePackingItem = catchAsync(async (req, res) => {
  const item = await tripService.updatePackingItem(req.params.id, req.params.itemId, req.user.id, req.body);
  return sendSuccess(res, 200, "Packing item updated successfully.", item);
});

const deletePackingItem = catchAsync(async (req, res) => {
  await tripService.deletePackingItem(req.params.id, req.params.itemId, req.user.id);
  return sendSuccess(res, 200, "Packing item deleted successfully.");
});

const resetPackingItems = catchAsync(async (req, res) => {
  await tripService.resetPackingItems(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Packing checklist reset successfully.");
});

const listNotes = catchAsync(async (req, res) => {
  const result = await tripService.listNotes(req.params.id, req.user.id, req.query);
  return sendSuccess(res, 200, "Trip notes fetched successfully.", result.items, result.meta);
});

const createNote = catchAsync(async (req, res) => {
  const note = await tripService.createNote(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 201, "Trip note created successfully.", note);
});

const updateNote = catchAsync(async (req, res) => {
  const note = await tripService.updateNote(req.params.id, req.params.noteId, req.user.id, req.body);
  return sendSuccess(res, 200, "Trip note updated successfully.", note);
});

const deleteNote = catchAsync(async (req, res) => {
  await tripService.deleteNote(req.params.id, req.params.noteId, req.user.id);
  return sendSuccess(res, 200, "Trip note deleted successfully.");
});

const createShare = catchAsync(async (req, res) => {
  const share = await tripService.createShare(req.params.id, req.user.id);
  return sendSuccess(res, 201, "Trip sharing enabled successfully.", share);
});

const updateShare = catchAsync(async (req, res) => {
  const share = await tripService.updateShare(req.params.id, req.user.id, req.body);
  return sendSuccess(res, 200, "Trip sharing updated successfully.", share);
});

const deleteShare = catchAsync(async (req, res) => {
  await tripService.deleteShare(req.params.id, req.user.id);
  return sendSuccess(res, 200, "Trip sharing removed successfully.");
});

const getPublicTrip = catchAsync(async (req, res) => {
  const trip = await tripService.getPublicTrip(req.params.token);
  return sendSuccess(res, 200, "Shared trip fetched successfully.", trip);
});

const copyPublicTrip = catchAsync(async (req, res) => {
  const trip = await tripService.copyPublicTrip(req.params.token, req.user.id);
  return sendSuccess(res, 201, "Trip copied successfully.", trip);
});

module.exports = {
  listTrips,
  createTrip,
  listPublicTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addStop,
  updateStop,
  deleteStop,
  reorderStops,
  addStopActivity,
  updateStopActivity,
  deleteStopActivity,
  reorderStopActivities,
  getItinerary,
  getBudgetSummary,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  listPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  resetPackingItems,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  createShare,
  updateShare,
  deleteShare,
  getPublicTrip,
  copyPublicTrip
};
