const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authMiddleware");
const { UserController } = require("../controllers");

router.get("/", authenticateMiddleware, UserController.getUsers);
router.get("/all", authenticateMiddleware, UserController.getAllUsers);
router.post(
  "/follow/:userId",
  authenticateMiddleware,
  UserController.followUser
);

router.get("/:username", UserController.getUser);
router.put("/", [authenticateMiddleware], UserController.updateUser);
router.delete("/", [authenticateMiddleware], UserController.deleteUser);

module.exports = router;
