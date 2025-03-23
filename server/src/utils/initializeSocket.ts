import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

export const initializeSocketIO = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict this to your frontend URL
      methods: ['GET', 'POST']
    }
  });

  // Map to store user socket connections
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join personal room for direct messages
    socket.on('joinPersonalRoom', ({ userId, userType }) => {
      if (!userId) return;
      
      // Store the socket connection with user info
      userSockets.set(userId, {
        socketId: socket.id,
        userType
      });
      
      // Join a room named after the user's ID
      socket.join(userId);
      console.log(`${userType} ${userId} joined personal room`);
    });

    // Handle direct messages between users and farmers
    socket.on('sendDirectMessage', async (data) => {
      try {
        const { senderId, receiverId, content, senderType } = data;
        
        if (!senderId || !receiverId || !content) {
          socket.emit('messageError', { error: 'Missing required fields' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content,
            senderType,
            isRead: false
          }
        });

        // Get sender and receiver names
        let senderName, receiverName;
        
        if (senderType === 'user') {
          const user = await prisma.users.findUnique({
            where: { id: senderId }
          });
          senderName = user?.emailID || 'Unknown User';
          
          const farmer = await prisma.farmers.findUnique({
            where: { id: receiverId }
          });
          receiverName = farmer?.id || 'Unknown Farmer';
        } else {
          const farmer = await prisma.farmers.findUnique({
            where: { id: senderId }
          });
          senderName = farmer?.id || 'Unknown Farmer';
          
          const user = await prisma.users.findUnique({
            where: { id: receiverId }
          });
          receiverName = user?.emailID || 'Unknown User';
        }

        // Format message for clients
        const formattedMessage = {
          id: message.id,
          senderId,
          receiverId,
          sender: senderName,
          receiver: receiverName,
          content: message.content,
          message: message.content, // For compatibility
          timestamp: message.createdAt.toISOString(),
          isRead: message.isRead,
          senderType
        };

        // Send to sender's room for confirmation
        socket.emit('messageSent', formattedMessage);
        
        // Send to receiver's room if they're online
        if (userSockets.has(receiverId)) {
          io.to(receiverId).emit('receiveDirectMessage', formattedMessage);
        }
        
        // Also send to sender's room to update all their devices
        io.to(senderId).emit('receiveDirectMessage', formattedMessage);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Mark a message as read
    socket.on('markMessageAsRead', async ({ messageId, userId }) => {
      try {
        if (!messageId) return;
        
        // Update message in database
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true }
        });
        
        // Get the message to find the sender
        const message = await prisma.message.findUnique({
          where: { id: messageId }
        });
        
        if (message) {
          // Notify the sender that their message was read
          io.to(message.senderId).emit('messageRead', { messageId });
        }
        
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Mark all messages from a sender to a receiver as read
    socket.on('markAllMessagesAsRead', async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) return;
        
        // Update all unread messages from sender to receiver
        const { count } = await prisma.message.updateMany({
          where: {
            senderId,
            receiverId,
            isRead: false
          },
          data: { isRead: true }
        });
        
        // Get all updated message IDs
        const messages = await prisma.message.findMany({
          where: {
            senderId,
            receiverId,
            isRead: true
          },
          select: { id: true }
        });
        
        // Notify the sender that their messages were read
        messages.forEach(msg => {
          io.to(senderId).emit('messageRead', { messageId: msg.id });
        });
        
        console.log(`Marked ${count} messages as read`);
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('userTyping', ({ senderId, receiverId, isTyping }) => {
      if (!senderId || !receiverId) return;
      
      // Send typing status to receiver
      io.to(receiverId).emit('userTypingStatus', { userId: senderId, isTyping });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove user from userSockets map
      for (const [userId, data] of userSockets.entries()) {
        if (data.socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};
