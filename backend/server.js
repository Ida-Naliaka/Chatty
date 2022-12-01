const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const authRoutes = require("./Routes/authRoutes");
const { notFound, errorHandler } = require("./Middleware/errorMiddleware");
const path = require("path");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
app.use(express.json()); //accept json data
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};
connectDB();
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//-------------------------deployment setup
const __dirname2 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname2, "/chatty/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname2, "chatty", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully..");
  });
}
//-------------------------deployment setup

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const server = app.listen(port, console.log(`Server Started on PORT ${port}`));
/*
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("user connected");
    console.log("user setup is working");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    console.log("a new message has been sent");
    console.log(newMessageReceived);

    var chat = newMessageReceived.chat;
    if (!chat.users) {
      console.log("chat.users not defined");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender[0]._id) {
        return;
      } else {
        socket.broadcast
          .to(user._id)
          .emit("message received", newMessageReceived);
        console.log("notification emitted");
      }
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});*/
