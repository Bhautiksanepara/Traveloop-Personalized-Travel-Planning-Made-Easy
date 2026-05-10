const express = require("express");
const tripController = require("../controllers/tripController");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { publicLimiter } = require("../middlewares/rateLimiter");
const { z } = require("../validators/commonValidators");

const router = express.Router();

router.get("/trips/:token", publicLimiter, validate(z.object({ token: z.string().min(10) }), "params"), tripController.getPublicTrip);
router.post(
  "/trips/:token/copy",
  publicLimiter,
  requireAuth,
  validate(z.object({ token: z.string().min(10) }), "params"),
  tripController.copyPublicTrip
);

module.exports = router;
