const express = require("express");
const userController = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { z, idSchema } = require("../validators/commonValidators");
const {
  updateProfileSchema,
  savedDestinationSchema,
  savedDestinationQuerySchema
} = require("../validators/userValidators");

const router = express.Router();

router.use(requireAuth);

router.get("/me", userController.getMe);
router.patch("/me", validate(updateProfileSchema), userController.updateMe);
router.delete("/me", userController.deleteMe);

router.get("/me/saved-destinations", validate(savedDestinationQuerySchema, "query"), userController.getSavedDestinations);
router.post("/me/saved-destinations", validate(savedDestinationSchema), userController.addSavedDestination);
router.delete(
  "/me/saved-destinations/:cityId",
  validate(z.object({ cityId: idSchema }), "params"),
  userController.removeSavedDestination
);

module.exports = router;
