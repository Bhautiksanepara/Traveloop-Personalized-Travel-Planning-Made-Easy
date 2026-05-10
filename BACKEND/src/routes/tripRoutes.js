const express = require("express");
const tripController = require("../controllers/tripController");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { z } = require("../validators/commonValidators");
const {
  tripSchema,
  tripUpdateSchema,
  tripQuerySchema,
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
const tripIdSchema = z.object({ id: z.string().uuid() });
const stopIdSchema = z.object({ id: z.string().uuid(), stopId: z.string().uuid() });
const stopActivityIdSchema = z.object({
  id: z.string().uuid(),
  stopId: z.string().uuid(),
  stopActivityId: z.string().uuid()
});
const expenseIdSchema = z.object({ id: z.string().uuid(), expenseId: z.string().uuid() });
const itemIdSchema = z.object({ id: z.string().uuid(), itemId: z.string().uuid() });
const noteIdSchema = z.object({ id: z.string().uuid(), noteId: z.string().uuid() });

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

router.get("/:id/itinerary", validate(tripIdSchema, "params"), tripController.getItinerary);
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
