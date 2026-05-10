const express = require("express");
const activityController = require("../controllers/activityController");
const validate = require("../middlewares/validate");
const { z } = require("../validators/commonValidators");
const { activityQuerySchema } = require("../validators/activityValidators");

const router = express.Router();

router.get("/", validate(activityQuerySchema, "query"), activityController.listActivities);
router.get("/:id", validate(z.object({ id: z.string().uuid() }), "params"), activityController.getActivity);

module.exports = router;
