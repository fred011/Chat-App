import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // adjust as needed
  },
});

// Store the mapping of userId to socketId
const userSocketMap = {}; // {userId: socketId}

// Function to get the socket ID of a user
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit the updated list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("messageDeleted", ({ messageId, deleteForEveryone, userIds }) => {
    if (Array.isArray(userIds)) {
      userIds.forEach((userId) => {
        const socketId = userSocketMap[userId];
        if (socketId) {
          io.to(socketId).emit("messageDeleted", {
            messageId,
            deleteForEveryone,
          });
        }
      });
    } else {
      console.error("userIds is not an array:", userIds);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Exporting necessary values for use in other parts of the app
export { io, app, server, userSocketMap };
