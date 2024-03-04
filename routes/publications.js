const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authMiddleware");
const multerMiddleware = require("../middlewares/multerMiddleware");
const {
  publishPost,
  getAllPosts,
  contentActionHandler,
  getPopularPosts,
} = require("../controllers/postController");

router.post(
  "/publish",
  [authenticateMiddleware, multerMiddleware],
  publishPost
);

router.get("/", [authenticateMiddleware], getAllPosts);

router.post("/action/:contentId", authenticateMiddleware, contentActionHandler);

router.get("/popular", authenticateMiddleware, getPopularPosts);

module.exports = router;
