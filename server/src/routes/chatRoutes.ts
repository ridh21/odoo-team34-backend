import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get all farmers (for users to chat with)
router.get("/farmers", function(req, res) {
  (async () => {
    try {
      const farmers = await prisma.farmers.findMany({
        select: {
          id: true,
          adharCard: {
            select: {
              name: true,
              mobileNumber: true,
            }
          },
          crops: {
            select: {
              cropName: true
            }
          }
        }
      });
      
      // Format the response
      const formattedFarmers = farmers.map(farmer => ({
        id: farmer.id,
        name: farmer.adharCard.name,
        phone: farmer.adharCard.mobileNumber || "",
        products: farmer.crops.map(crop => crop.cropName)
      }));
      
      res.status(200).json(formattedFarmers);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      res.status(500).json({ error: "Failed to fetch farmers" });
    }
  })();
});

// Get all users who have messaged a specific farmer
router.get("/farmer/:farmerId/conversations", function(req, res) {
  (async () => {
    try {
      const { farmerId } = req.params;
      
      // Find all users who have sent messages to this farmer
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { receiverId: farmerId, senderType: "user" },
            { senderId: farmerId, senderType: "farmer" }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          sender: {
            select: {
              id: true,
              emailID: true,
              mobileNumber: true
            }
          }
        },
        distinct: ['senderId']
      });
      
      // Get unread message counts
      const unreadCounts = await Promise.all(
        messages
          .filter(msg => msg.senderType === "user")
          .map(async (msg) => {
            const count = await prisma.message.count({
              where: {
                senderId: msg.senderId,
                receiverId: farmerId,
                senderType: "user",
                isRead: false
              }
            });
            return { userId: msg.senderId, count };
          })
      );
      
      // Format the response
      const conversations = await Promise.all(
        messages.map(async (msg) => {
          // Only process messages from users to this farmer
          if (msg.senderType === "user" || (msg.senderType === "farmer" && msg.receiverId !== farmerId)) {
            const userId = msg.senderType === "user" ? msg.senderId : msg.receiverId;
            
            // Get the last message between this user and farmer
            const lastMessage = await prisma.message.findFirst({
              where: {
                OR: [
                  { senderId: userId, receiverId: farmerId },
                  { senderId: farmerId, receiverId: userId }
                ]
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
            
            // Get user details
            const user = await prisma.users.findUnique({
              where: { id: userId }
            });
            
            // Get unread count
            const unreadCount = unreadCounts.find(uc => uc.userId === userId)?.count || 0;
            
            return {
              id: userId,
              name: user?.emailID || user?.mobileNumber || "Unknown User",
              lastMessage: lastMessage?.content || "",
              lastMessageTime: lastMessage?.createdAt.toISOString() || "",
              unreadCount
            };
          }
          return null;
        })
      );
      
      // Filter out null values and remove duplicates
      const filteredConversations = conversations
        .filter(Boolean)
        .filter((conv, index, self) => 
          index === self.findIndex(c => c?.id === conv?.id)
        );
      
      res.status(200).json(filteredConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  })();
});

// Get all farmers who have messaged a specific user
router.get("/user/:userId/conversations", function(req, res) {
  (async () => {
    try {
      const { userId } = req.params;
      
      // Find all farmers who have sent messages to this user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, senderType: "user" },
            { receiverId: userId, senderType: "farmer" }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          receiver: {
            select: {
              id: true,
              adharCard: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        distinct: ['receiverId']
      });
      
      // Get unread message counts
      const unreadCounts = await Promise.all(
        messages
          .filter(msg => msg.senderType === "farmer")
          .map(async (msg) => {
            const count = await prisma.message.count({
              where: {
                senderId: msg.senderId,
                receiverId: userId,
                senderType: "farmer",
                isRead: false
              }
            });
            return { farmerId: msg.senderId, count };
          })
      );
      
      // Format the response
      const conversations = await Promise.all(
        messages.map(async (msg) => {
          // Only process messages from farmers to this user
          if (msg.senderType === "farmer" || (msg.senderType === "user" && msg.senderId === userId)) {
            const farmerId = msg.senderType === "farmer" ? msg.senderId : msg.receiverId;
            
            // Get the last message between this farmer and user
            const lastMessage = await prisma.message.findFirst({
              where: {
                OR: [
                  { senderId: farmerId, receiverId: userId },
                  { senderId: userId, receiverId: farmerId }
                ]
              },
              orderBy: {
                createdAt: 'desc'
              }
            });
            
            // Get farmer details
            const farmer = await prisma.farmers.findUnique({
              where: { id: farmerId },
              include: {
                adharCard: true,
                crops: true
              }
            });
            
            // Get unread count
            const unreadCount = unreadCounts.find(uc => uc.farmerId === farmerId)?.count || 0;
            
            return {
              id: farmerId,
              name: farmer?.adharCard?.name || "Unknown Farmer",
              products: farmer?.crops.map(crop => crop.cropName) || [],
              lastMessage: lastMessage?.content || "",
              lastMessageTime: lastMessage?.createdAt.toISOString() || "",
              unreadCount
            };
          }
          return null;
        })
      );
      
      // Filter out null values and remove duplicates
      const filteredConversations = conversations
        .filter(Boolean)
        .filter((conv, index, self) => 
          index === self.findIndex(c => c?.id === conv?.id)
        );
      
      res.status(200).json(filteredConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  })();
});

// Get chat history between user and farmer
router.get("/messages", function(req, res) {
  (async () => {
    try {
      const { userId, farmerId } = req.query as { userId: string, farmerId: string };
      
      if (!userId || !farmerId) {
        return res.status(400).json({ error: "Both userId and farmerId are required" });
      }
      
      // Get messages between user and farmer
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: farmerId },
            { senderId: farmerId, receiverId: userId }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Get user and farmer details
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { emailID: true, mobileNumber: true }
      });
      
      const farmer = await prisma.farmers.findUnique({
        where: { id: farmerId },
        include: {
          adharCard: {
            select: { name: true }
          }
        }
      });
      
      // Format the messages for the frontend
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        sender: msg.senderType === "user" ? 
          (user?.emailID || user?.mobileNumber || "User") : 
          (farmer?.adharCard?.name || "Farmer"),
        senderId: msg.senderId,
        receiver: msg.senderType === "user" ? 
          (farmer?.adharCard?.name || "Farmer") : 
          (user?.emailID || user?.mobileNumber || "User"),
        receiverId: msg.receiverId,
        message: msg.content,
        timestamp: msg.createdAt.toISOString(),
        isRead: msg.isRead,
        senderType: msg.senderType
      }));
      
      res.status(200).json(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  })();
});

// Save a new message
router.post("/messages", function(req, res) {
  (async () => {
    try {
      const { senderId, receiverId, senderType, content } = req.body;
      
      if (!senderId || !receiverId || !senderType || !content) {
        return res.status(400).json({ 
          error: "senderId, receiverId, senderType, and content are required" 
        });
      }
      
      // Validate sender type
      if (senderType !== "user" && senderType !== "farmer") {
        return res.status(400).json({ error: "senderType must be 'user' or 'farmer'" });
      }
      
      // Create the message
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content,
          senderType,
          isRead: false
        }
      });
      
      res.status(201).json({ 
        id: newMessage.id,
        timestamp: newMessage.createdAt,
        message: "Message sent successfully" 
      });
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Failed to save message" });
    }
  })();
});

// Mark message as read
router.put("/messages/:messageId/read", function(req, res) {
  (async () => {
    try {
      const { messageId } = req.params;
      
      const updatedMessage = await prisma.message.update({
        where: {
          id: messageId
        },
        data: {
          isRead: true
        }
      });
      
      res.status(200).json({ 
        id: updatedMessage.id,
        message: "Message marked as read" 
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  })();
});

// Mark all messages as read
router.put("/messages/read", function(req, res) {
  (async () => {
    try {
      const { senderId, receiverId } = req.body;
      
      if (!senderId || !receiverId) {
        return res.status(400).json({ 
          error: "Both senderId and receiverId are required" 
        });
      }
      
      // Mark all messages from sender to receiver as read
      const updateResult = await prisma.message.updateMany({
        where: {
          senderId,
          receiverId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      res.status(200).json({ 
        count: updateResult.count,
        message: `${updateResult.count} messages marked as read` 
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  })();
});

export default router;
