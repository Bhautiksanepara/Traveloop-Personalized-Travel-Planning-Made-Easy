const express = require("express");
const activityController = require("../controllers/activityController");
const validate = require("../middlewares/validate");
const { z, idSchema } = require("../validators/commonValidators");
const { activityQuerySchema } = require("../validators/activityValidators");

const router = express.Router();

router.get("/", validate(activityQuerySchema, "query"), activityController.listActivities);
router.get("/:id", validate(z.object({ id: idSchema }), "params"), activityController.getActivity);

module.exports = router;
