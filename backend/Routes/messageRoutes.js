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
router.route("/:messageId").get(protect, findMessage);
router.route("/").post(protect, sendMessage);
router.route("/read").put(protect, updateRead);
router.route("/remove").put(protect, removeMessage);
module.exports = router;
