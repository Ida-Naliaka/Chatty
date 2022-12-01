const expressAsyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { chatId, content, attachment } = req.body;
  console.log("sending has started");
  if (!chatId) {
    console.log("No chat Id  passed into request");
    return res.sendStatus(400);
  } else if (!attachment && !content) {
    console.log("No message or attachment passed into request");
    return res.sendStatus(400);
  } else if (content !== undefined) {
    console.log(" message passed into request");
    var newMessage = {
      sender: req.user._id,
      sentAt: new Date(),
      content: content,
      chat: chatId,
    };
    try {
      var message = await Message.create(newMessage);

      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  } else if (attachment !== undefined) {
    console.log(" attachment passed into request");
    var newMessage = {
      sender: req.user._id,
      sentAt: new Date(),
      attachment: attachment,
      chat: chatId,
    };
    try {
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const removeMessage = expressAsyncHandler(async (req, res) => {
  const { chatId, messageId } = req.body;
  // check if the requester is the sender of the message

  if (!chatId || !messageId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    const removed = await Message.findByIdAndDelete(messageId);
    const allMessages = await Message.find({ chat: chatId });
    const sortedMessages = allMessages.sort((a, b) => {
      return a.sentAt < b.sentAt ? -1 : a.sentAt > b.sentAt ? 1 : 0;
    });
    await Chat.findByIdAndUpdate(
      chatId,
      { latestMessage: sortedMessages[sortedMessages.length - 1] },
      { new: true }
    );

    res.json(removed);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  allMessages,
  sendMessage,
  removeMessage,
};
