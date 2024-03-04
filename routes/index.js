const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");

const { controllerRootSlash } = require("../controllers");

router.get("/", controllerRootSlash);
router.use("/auth", authRoutes);
router.use("/publications", require("./publications"));
router.use("/users", require("./users"));

module.exports = router;
