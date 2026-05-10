const express = require("express");
const cityController = require("../controllers/cityController");
const validate = require("../middlewares/validate");
const { z, idSchema } = require("../validators/commonValidators");
const { cityQuerySchema, cityActivityQuerySchema } = require("../validators/cityValidators");

const router = express.Router();

router.get("/", validate(cityQuerySchema, "query"), cityController.listCities);
router.get("/search", validate(cityQuerySchema, "query"), cityController.listCities);
router.get("/:id", validate(z.object({ id: idSchema }), "params"), cityController.getCity);
router.get(
  "/:id/activities",
  validate(z.object({ id: idSchema }), "params"),
  validate(cityActivityQuerySchema, "query"),
  cityController.getCityActivities
);

module.exports = router;
