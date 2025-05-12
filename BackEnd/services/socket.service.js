import { Server } from "socket.io";
import { verifyToken } from "./auth.service.js";
import ChatMessage from "../models/ChatMessage.schema.js";
import { Types } from "mongoose";
import UserBan from "../users/models/UserBanSchema.js";
import GroupBan from "../users/models/GroupBan.schema.js";

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type"],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("No token provided");

      const userData = verifyToken(token);
      if (!userData) throw new Error("Invalid token");

      socket.user = {
        _id: userData._id,
        isAdmin: userData.isAdmin || false,
        isModerator: userData.isModerator || false,
        username: userData.username,
      };

      const activeBan = await UserBan.findOne({
        userId: userData._id,
        banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      if (activeBan) {
        const expiry =
          activeBan.banDuration === "permanent"
            ? null
            : new Date(
              activeBan.banStartDate.getTime() +
              (activeBan.banDuration === "1h"
                ? 3600000
                : activeBan.banDuration === "24h"
                  ? 86400000
                  : 604800000)
            );

        if (!expiry || expiry > new Date()) {
          socket.emit("accountBanned", {
            reason: activeBan.banReason,
            expiry: expiry || "permanent",
          });
          socket.disconnect(true);
          return;
        }
      }

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  const handleJoinRoom = async (socket, roomId, callback) => {
    try {
      if (!roomId || typeof roomId !== "string") {
        throw new Error("Invalid room ID");
      }

      const previousRooms = Array.from(socket.rooms).filter(
        (r) => r !== socket.id
      );
      for (const room of previousRooms) {
        socket.leave(room);
        console.log(`🚪 User ${socket.user._id} left room ${room}`);
        io.to(room).emit("memberLeft", {
          userId: socket.user._id,
          roomId: room,
        });
      }

      await socket.join(roomId);
      console.log(`🗨️ User ${socket.user._id} joined room ${roomId}`);

      const messages = await ChatMessage.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("userId", "username profileImage");

      callback({ success: true });
      socket.emit("roomHistory", messages.reverse());
    } catch (err) {
      console.error("Room join error:", err);
      callback({ success: false, error: err.message });
    }
  };

  const handleSendGroupMessage = async (socket, { roomId, content }) => {
    try {
      if (
        !roomId ||
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        throw new Error("Invalid message data");
      }

      const message = new ChatMessage({
        roomId,
        content: content.trim(),
        userId: new Types.ObjectId(socket.user._id),
        isPrivate: false,
      });

      await message.save();

      const fullMessage = await ChatMessage.populate(message, {
        path: "userId",
        select: "username profileImage",
      });

      io.to(roomId).emit("newMessage", fullMessage);
    } catch (err) {
      console.error("Group message send error:", err);
      socket.emit("error", "Failed to send group message");
    }
  };

  const handleSendPrivateMessage = async (socket, { roomId, content }) => {
    try {
      if (!roomId || !content) throw new Error("Invalid message data");

      const [_, user1Id, user2Id] = roomId.split("_");
      const recipientId = socket.user._id === user1Id ? user2Id : user1Id;

      const message = new ChatMessage({
        roomId,
        content: content.trim(),
        userId: new Types.ObjectId(socket.user._id.toString()),
        recipientId: new Types.ObjectId(recipientId.toString()),
        isPrivate: true,
      });

      await message.save();

      const fullMessage = await ChatMessage.populate(message, {
        path: "userId",
        select: "username profileImage",
      });

      io.to(roomId).emit("newPrivateMessage", fullMessage);
    } catch (err) {
      console.error("Private message error:", err);
      socket.emit("error", "Failed to send message");
    }
  };

  const setupModerationEvents = (socket) => {
    socket.on("modDeleteMessage", async ({ messageId, roomId }) => {
      if (!socket.user?.isModerator && !socket.user?.isAdmin) {
        return socket.emit("modError", "Insufficient privileges");
      }

      try {
        await ChatMessage.deleteOne({ _id: messageId });
        io.to(roomId).emit("messageRemoved", { messageId });
      } catch (err) {
        console.error("Message deletion failed:", err);
      }
    });

    socket.on(
      "modBanFromGroup",
      async ({ userId, groupId, duration, reason }) => {
        if (!socket.user?.isModerator && !socket.user?.isAdmin) return;

        try {
          const newBan = new GroupBan({
            groupId,
            userId,
            bannedBy: socket.user._id,
            banDuration: duration,
            banReason: reason,
          });

          await newBan.save();

          io.to(userId).emit("groupBanApplied", {
            groupId,
            duration,
            reason,
            bannedBy: socket.user.username,
          });

          io.to(groupId).emit("userBannedFromGroup", {
            userId,
            moderator: socket.user.username,
          });
        } catch (err) {
          console.error("Group ban failed:", err);
        }
      }
    );
  };

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user._id} (ID: ${socket.id})`);
    setupModerationEvents(socket);

    socket.on("adminBanUser", async ({ userId, duration, reason }) => {
      if (!socket.user.isAdmin) return;

      const ban = new UserBan({
        userId,
        bannedBy: socket.user._id,
        banDuration: duration,
        banReason: reason,
      });
      await ban.save();

      io.to(userId).emit("accountBanned", {
        reason,
        expiry: duration === "permanent" ? "permanent" : duration,
      });
      io.sockets.sockets.forEach((s) => {
        if (s.user?._id.toString() === userId.toString()) {
          s.disconnect(true);
        }
      });
    });

    socket.on("ping", (cb) => cb());

    socket.on("joinRoom", (roomId, callback) => {
      handleJoinRoom(socket, roomId, callback);
    });

    socket.on("joinPrivateRoom", (roomId) => {
      socket.join(roomId);
      console.log(`🔒 User ${socket.user._id} joined private room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      if (roomId && typeof roomId === "string") {
        socket.leave(roomId);
        console.log(`🚪 User ${socket.user._id} left room ${roomId}`);
        io.to(roomId).emit("memberLeft", { userId: socket.user._id, roomId });
      }
    });

    socket.on("sendMessage", (data) => {
      handleSendGroupMessage(socket, data);
    });

    socket.on("sendPrivateMessage", (data) => {
      console.log("private message", data);

      handleSendPrivateMessage(socket, data);
    });

    socket.on("disconnecting", (reason) => {
      console.log(`⚠️ User ${socket.user._id} disconnecting:`, reason);
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
          console.log(
            `🚪 User ${socket.user._id} left room ${room} due to disconnect`
          );
          io.to(room).emit("memberLeft", {
            userId: socket.user._id,
            roomId: room,
          });
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.user._id} disconnected`);
    });
  });

  io.engine.on("connection_error", (err) => {
    console.error("Socket.io connection error:", err);
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export { initSocket, getIO };
