const express = require("express");
const tripController = require("../controllers/tripController");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { publicLimiter } = require("../middlewares/rateLimiter");
const { z, paginationSchema } = require("../validators/commonValidators");

const router = express.Router();

router.get(
  "/trips",
  publicLimiter,
  validate(
    paginationSchema.extend({
      search: z.string().trim().min(1).optional()
    }),
    "query"
  ),
  tripController.listPublicTrips
);
router.get("/trips/:token", publicLimiter, validate(z.object({ token: z.string().min(10) }), "params"), tripController.getPublicTrip);
router.post(
  "/trips/:token/copy",
  publicLimiter,
  requireAuth,
  validate(z.object({ token: z.string().min(10) }), "params"),
  tripController.copyPublicTrip
);

module.exports = router;
