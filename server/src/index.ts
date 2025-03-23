// 

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import farmerRoutes from "./routes/farmerRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";

// Initialize Prisma client
const prisma = new PrismaClient();

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Store connected users and their socket IDs
interface ConnectedUser {
  userId: string;
  userType: string; // "user" or "farmer"
  socketId: string;
}

const connectedUsers: ConnectedUser[] = [];

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);

  // For joining a personal room (for direct messages)
  socket.on("joinPersonalRoom", ({ userId, userType }) => {
    if (!userId || !userType) {
      console.error("Invalid joinPersonalRoom data:", { userId, userType });
      return;
    }

    // Add user to connected users list
    const existingUserIndex = connectedUsers.findIndex(u => u.userId === userId);
    
    if (existingUserIndex >= 0) {
      // Update existing user's socket ID
      connectedUsers[existingUserIndex].socketId = socket.id;
    } else {
      // Add new connected user
      connectedUsers.push({ userId, userType, socketId: socket.id });
    }
    
    // Join a room with the user's ID
    socket.join(userId);
    console.log(`${userType} (${userId}) joined their personal room`);
  });

  // For sending direct messages
  socket.on("sendDirectMessage", async (messageData) => {
    try {
      const { senderId, receiverId, content, senderType } = messageData;
      
      // Save message to database
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content,
          senderType,
          isRead: false
        }
      });
      
      // Add database ID and timestamp to message
      const messageToSend = {
        ...messageData,
        id: newMessage.id,
        timestamp: newMessage.createdAt.toISOString(),
        isRead: false
      };
      
      // Send to receiver's room - they should have joined a room with their ID
      io.to(receiverId).emit("receiveDirectMessage", messageToSend);
      
      // Also send back to sender's room for confirmation
      io.to(senderId).emit("messageSent", messageToSend);
      
      console.log(`Message sent from ${senderType} (${senderId}) to ${receiverId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { 
        error: "Failed to send message",
        originalMessage: messageData
      });
    }
  });
  

  // Mark a message as read
  socket.on("markMessageAsRead", async ({ messageId, userId }) => {
    try {
      if (!messageId || !userId) {
        console.error("Invalid markMessageAsRead data:", { messageId, userId });
        return;
      }

      // Update message in database
      const message = await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true }
      });
      
      // Notify the sender that their message was read
      io.to(message.senderId).emit("messageRead", { 
        messageId, 
        readBy: userId 
      });
      
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  });

  // Mark all messages from a sender as read
  socket.on("markAllMessagesAsRead", async ({ senderId, receiverId }) => {
    try {
      if (!senderId || !receiverId) {
        console.error("Invalid markAllMessagesAsRead data:", { senderId, receiverId });
        return;
      }

      // Update all unread messages from sender to receiver
      const { count } = await prisma.message.updateMany({
        where: {
          senderId,
          receiverId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      console.log(`Marked ${count} messages as read from ${senderId} to ${receiverId}`);
      
      // Notify the sender that all their messages were read
      io.to(senderId).emit("allMessagesRead", { 
        readBy: receiverId 
      });
      
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  });

  // User typing indicator
  socket.on("userTyping", ({ senderId, receiverId, isTyping }) => {
    if (!senderId || !receiverId) {
      console.error("Invalid userTyping data:", { senderId, receiverId, isTyping });
      return;
    }

    // Send typing status directly to receiver's room
    io.to(receiverId).emit("userTypingStatus", {
      userId: senderId,
      isTyping
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client Disconnected:", socket.id);
    
    // Remove user from connected users list
    const userIndex = connectedUsers.findIndex(u => u.socketId === socket.id);
    if (userIndex >= 0) {
      const user = connectedUsers[userIndex];
      console.log(`${user.userType} (${user.userId}) disconnected`);
      connectedUsers.splice(userIndex, 1);
    }
  });
});

// Routes
app.use("/api/farmers", farmerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
