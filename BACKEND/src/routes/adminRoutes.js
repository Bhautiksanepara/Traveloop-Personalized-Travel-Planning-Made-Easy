const express = require("express");
const adminController = require("../controllers/adminController");
const validate = require("../middlewares/validate");
const { requireAuth, requireAdmin } = require("../middlewares/auth");
const { z, idSchema } = require("../validators/commonValidators");
const { userQuerySchema, updateUserSchema, tripQuerySchema } = require("../validators/adminValidators");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", adminController.getOverview);
router.get("/users", validate(userQuerySchema, "query"), adminController.listUsers);
router.get("/users/:id", validate(z.object({ id: idSchema }), "params"), adminController.getUser);
router.patch("/users/:id", validate(z.object({ id: idSchema }), "params"), validate(updateUserSchema), adminController.updateUser);
router.get("/trips", validate(tripQuerySchema, "query"), adminController.listTrips);
router.delete("/trips/:id", validate(z.object({ id: idSchema }), "params"), adminController.deleteTrip);
router.get("/analytics/cities", adminController.getTopCities);
router.get("/analytics/activities", adminController.getTopActivities);
router.get("/analytics/engagement", adminController.getEngagement);

module.exports = router;
