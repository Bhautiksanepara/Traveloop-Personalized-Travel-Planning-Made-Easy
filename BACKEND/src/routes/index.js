const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const cityRoutes = require("./cityRoutes");
const activityRoutes = require("./activityRoutes");
const tripRoutes = require("./tripRoutes");
const publicRoutes = require("./publicRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cities", cityRoutes);
router.use("/activities", activityRoutes);
router.use("/trips", tripRoutes);
router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
