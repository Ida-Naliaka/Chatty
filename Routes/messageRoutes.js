const express = require("express");
const {
  allMessages,
  sendMessage,
  removeMessage,
  updateRead,
  findMessage,
} = require("../Controllers/messageControllers");
const protect = require("../Middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/remove").put(protect, removeMessage);
module.exports = router;
