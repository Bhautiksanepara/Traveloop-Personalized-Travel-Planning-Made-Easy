const express = require("express");
const tripController = require("../controllers/tripController");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { z, idSchema } = require("../validators/commonValidators");
const {
  tripSchema,
  tripUpdateSchema,
  tripQuerySchema,
  itineraryQuerySchema,
  stopSchema,
  stopUpdateSchema,
  reorderStopsSchema,
  stopActivitySchema,
  stopActivityUpdateSchema,
  reorderStopActivitiesSchema,
  expenseSchema,
  expenseUpdateSchema,
  packingItemSchema,
  packingItemUpdateSchema,
  noteSchema,
  noteUpdateSchema,
  noteQuerySchema,
  shareUpdateSchema
} = require("../validators/tripValidators");

const router = express.Router();
const tripIdSchema = z.object({ id: idSchema });
const stopIdSchema = z.object({ id: idSchema, stopId: idSchema });
const stopActivityIdSchema = z.object({
  id: idSchema,
  stopId: idSchema,
  stopActivityId: idSchema
});
const expenseIdSchema = z.object({ id: idSchema, expenseId: idSchema });
const itemIdSchema = z.object({ id: idSchema, itemId: idSchema });
const noteIdSchema = z.object({ id: idSchema, noteId: idSchema });

router.use(requireAuth);

router.get("/", validate(tripQuerySchema, "query"), tripController.listTrips);
router.post("/", validate(tripSchema), tripController.createTrip);
router.get("/:id", validate(tripIdSchema, "params"), tripController.getTrip);
router.patch("/:id", validate(tripIdSchema, "params"), validate(tripUpdateSchema), tripController.updateTrip);
router.delete("/:id", validate(tripIdSchema, "params"), tripController.deleteTrip);

router.post("/:id/stops", validate(tripIdSchema, "params"), validate(stopSchema), tripController.addStop);
router.patch("/:id/stops/:stopId", validate(stopIdSchema, "params"), validate(stopUpdateSchema), tripController.updateStop);
router.delete("/:id/stops/:stopId", validate(stopIdSchema, "params"), tripController.deleteStop);
router.patch("/:id/stops/reorder", validate(tripIdSchema, "params"), validate(reorderStopsSchema), tripController.reorderStops);

router.post(
  "/:id/stops/:stopId/activities",
  validate(stopIdSchema, "params"),
  validate(stopActivitySchema),
  tripController.addStopActivity
);
router.patch(
  "/:id/stops/:stopId/activities/:stopActivityId",
  validate(stopActivityIdSchema, "params"),
  validate(stopActivityUpdateSchema),
  tripController.updateStopActivity
);
router.delete(
  "/:id/stops/:stopId/activities/:stopActivityId",
  validate(stopActivityIdSchema, "params"),
  tripController.deleteStopActivity
);
router.patch(
  "/:id/stops/:stopId/activities/reorder",
  validate(stopIdSchema, "params"),
  validate(reorderStopActivitiesSchema),
  tripController.reorderStopActivities
);

router.get("/:id/itinerary", validate(tripIdSchema, "params"), validate(itineraryQuerySchema, "query"), tripController.getItinerary);
router.get("/:id/budget-summary", validate(tripIdSchema, "params"), tripController.getBudgetSummary);
router.get("/:id/expenses", validate(tripIdSchema, "params"), tripController.listExpenses);
router.post("/:id/expenses", validate(tripIdSchema, "params"), validate(expenseSchema), tripController.createExpense);
router.patch("/:id/expenses/:expenseId", validate(expenseIdSchema, "params"), validate(expenseUpdateSchema), tripController.updateExpense);
router.delete("/:id/expenses/:expenseId", validate(expenseIdSchema, "params"), tripController.deleteExpense);

router.get("/:id/packing-items", validate(tripIdSchema, "params"), tripController.listPackingItems);
router.post("/:id/packing-items", validate(tripIdSchema, "params"), validate(packingItemSchema), tripController.createPackingItem);
router.patch("/:id/packing-items/:itemId", validate(itemIdSchema, "params"), validate(packingItemUpdateSchema), tripController.updatePackingItem);
router.delete("/:id/packing-items/:itemId", validate(itemIdSchema, "params"), tripController.deletePackingItem);
router.post("/:id/packing-items/reset", validate(tripIdSchema, "params"), tripController.resetPackingItems);

router.get("/:id/notes", validate(tripIdSchema, "params"), validate(noteQuerySchema, "query"), tripController.listNotes);
router.post("/:id/notes", validate(tripIdSchema, "params"), validate(noteSchema), tripController.createNote);
router.patch("/:id/notes/:noteId", validate(noteIdSchema, "params"), validate(noteUpdateSchema), tripController.updateNote);
router.delete("/:id/notes/:noteId", validate(noteIdSchema, "params"), tripController.deleteNote);

router.post("/:id/share", validate(tripIdSchema, "params"), tripController.createShare);
router.patch("/:id/share", validate(tripIdSchema, "params"), validate(shareUpdateSchema), tripController.updateShare);
router.delete("/:id/share", validate(tripIdSchema, "params"), tripController.deleteShare);

module.exports = router;
