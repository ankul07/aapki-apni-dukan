import dotenv from "dotenv";
import app from "./app.js";
import path from "path";
import connectDatabase from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";

/**
 * Load environment variables from .env file in non-production environments
 */
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

/**
 * Handle uncaught exceptions (e.g., synchronous code errors that aren't caught)
 */
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to an uncaught exception");
  process.exit(1);
});

/**
 * Connect to MongoDB database
 */
connectDatabase();

/**
 * Create HTTP server and attach Socket.io
 */
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.io Logic
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

io.on("connection", (socket) => {
  console.log("✓ A user is connected");

  // Add user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Send and get message
  const messages = {};

  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const message = createMessage({ senderId, receiverId, text, images });
    const user = getUser(receiverId);

    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    // Send message to receiver
    io.to(user?.socketId).emit("getMessage", message);
  });

  // Message seen
  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    if (messages[senderId]) {
      const message = messages[senderId].find(
        (message) =>
          message.receiverId === receiverId && message.id === messageId
      );
      if (message) {
        message.seen = true;
        io.to(user?.socketId).emit("messageSeen", {
          senderId,
          receiverId,
          messageId,
        });
      }
    }
  });

  // Update last message
  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
    io.emit("getLastMessage", {
      lastMessage,
      lastMessagesId,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("✗ A user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

/**
 * Start the Express server with Socket.io
 */
const server = httpServer.listen(process.env.PORT, () => {
  console.log(`✓ Server is running on http://localhost:${process.env.PORT}`);
});

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server due to: ${err.message}`);
  console.log("Shutting down the server due to an unhandled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
