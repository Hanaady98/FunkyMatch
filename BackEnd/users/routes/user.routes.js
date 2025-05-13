import { Router } from "express";
import User from "../models/User.schema.js";
import ChatMessage from "../../models/ChatMessage.schema.js";
import {
  createNewUser,
  getUserById,
  deleteUser,
  updateUser,
  changeAuthLevel,
  existingUser,
  getAllHobbies,
  addHobbyToUser,
  removeHobbyFromUser
} from "../services/usersDataAccess.service.js";
import { banUser, unbanUser, getUserBans } from "../controllers/ban.controller.js";
import { validate } from "../../middlewares/validation.js";
import RegisterSchema from "../validations/RegisterSchema.js";
import LoginSchema from "../validations/LoginSchema.js";
import { generateToken } from "../../services/auth.service.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import { isRegisteredUser } from "../../middlewares/isRegisteredUser.js";
import { isUser } from "../../middlewares/isUser.js";
import lodash from "lodash";
const { pick } = lodash;

const userRouter = Router();

/* ----- GET all users request ----- */
userRouter.get("/", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const newUsers = users.map((user) =>
      pick(user, [
        "_id",
        "username",
        "name",
        "isModerator",
        "isAdmin",
        "email",
        "address",
        "birthDate",
        "gender",
        "profileImage",
        "hobbies",
        "bio",
        "isBanned"
      ])
    );
    return res.json(newUsers);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/* --------------- Admin Ban Management --------------- */

// Ban a user
userRouter.post("/admin/ban", auth, isAdmin, banUser);

// Unban a user
userRouter.delete("/admin/ban/:userId", auth, isAdmin, unbanUser);

// Get user's ban history
userRouter.get("/admin/bans/:userId", auth, isAdmin, getUserBans);

/* ----- GET user profile by email or username ----- */
userRouter.get('/profile/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const query = identifier.includes('@')
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query)
      .select('name profileImage email username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      name: user.name,
      profileImage: user.profileImage,
      email: user.email,
      username: user.username
    });
  } catch (err) {
    console.error('Profile lookup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/* ----- GET user by Id request ----- */
/*needs authentication*/
userRouter.get("/:id", auth, isUser, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    return res.json(user);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

/* ----- GET user by Id request (public) ----- */
userRouter.get("/public/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(404).send(err.message);
  }
});


/* ----- POST add new user request - (register) ----- */
userRouter.post("/register", validate(RegisterSchema), async (req, res) => {
  try {
    console.log("Raw request body:", req.body);

    // First check if email exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        errorType: "EMAIL_EXISTS",
        message: "Email already in use",
      });
    }

    const user = await createNewUser(req.body);
    return res.json({ message: "new user created successfully", user });
  } catch (err) {
    // we handle other errors
    if (err.code === 11000 && err.keyPattern?.email) {
      // MongoDB duplicate key error
      return res.status(400).json({
        errorType: "EMAIL_EXISTS",
        message: "Email already in use",
      });
    }

    // Generic error handler
    return res.status(400).json({
      errorType: "REGISTRATION_ERROR",
      message: err.message,
    });
  }
});

// /* ----- POST existing user request - (login) ----- */
userRouter.post("/login", validate(LoginSchema), async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await existingUser({
      email: login.includes('@') ? login : undefined,
      username: !login.includes('@') ? login : undefined,
      password
    });

    const token = generateToken(user);
    if (!token) {
      throw new Error("Failed to generate token");
    }

    return res.json({
      token: token,
      user: pick(user.toObject(), [
        "_id",
        "username",
        "name",
        "email",
        "profileImage",
        "isAdmin",
        "isModerator"
      ])
    });
  } catch (err) {
    if (err.message.includes("Account banned")) {
      const banDetails = JSON.parse(err.message);
      return res.status(403).json({
        message: banDetails.message,
        reason: banDetails.reason,
        expiry: banDetails.expiry
      });
    }
    if (err.message === "No user found with the provided credentials") {
      return res.status(404).send(err.message);
    }
    if (err.message === "Password is incorrect") {
      return res.status(401).send(err.message);
    }
    return res.status(500).send(err.message);
  }
});


/* ----- DELETE user by Id request ----- */
/*needs authentication*/
userRouter.delete("/:id", auth, isUser, async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    return res.json({ message: "User deleted successfully", user: user });
  } catch (err) {
    res.status(404).send(err.message);
  }
});

/* ----- PUT user by Id request ----- */
/*needs authentication*/
userRouter.put("/:id", auth, isRegisteredUser(false), async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    return res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* ----- PATCH request to change the authLevel ----- */
userRouter.patch("/:id", auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    // Add validation for the role
    if (!role || !["Moderator", "Admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be either 'Moderator' or 'Admin'"
      });
    }

    const updatedUser = await changeAuthLevel(req.params.id, role);
    res.json({
      message: "Authorization level updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* --------------- Hobbies --------------- */

/* ----- GET all unique hobbies ----- */
userRouter.get("/hobbies/all", async (req, res) => {
  try {
    const hobbiesList = await getAllHobbies();
    return res.json(hobbiesList);
  } catch (err) {
    console.error("Error fetching all hobbies:", err);
    return res.status(500).send(err.message);
  }
});

/* ----- PATCH add hobby to user ----- */
userRouter.patch("/:id/add-hobby", auth, isUser, async (req, res) => {
  try {
    const { hobby } = req.body;
    const updatedHobbies = await addHobbyToUser(req.params.id, hobby);
    return res.json({
      message: "Hobby added successfully",
      hobbies: updatedHobbies
    });
  } catch (err) {
    const statusCode = err.message.includes("not found") ? 404 :
      err.message.includes("required") ||
        err.message.includes("already exists") ||
        err.message.includes("Maximum") ? 400 : 500;
    return res.status(statusCode).json({ message: err.message });
  }
});

/* ----- PATCH remove hobby from user ----- */
userRouter.patch("/:id/remove-hobby", auth, isUser, async (req, res) => {
  try {
    const { hobby } = req.body;
    const updatedHobbies = await removeHobbyFromUser(req.params.id, hobby);
    return res.json({
      message: "Hobby removed successfully",
      hobbies: updatedHobbies
    });
  } catch (err) {
    const statusCode = err.message.includes("not found") ? 404 :
      err.message.includes("required") ||
        err.message.includes("not found") ||
        err.message.includes("at least") ? 400 : 500;
    return res.status(statusCode).json({ message: err.message });
  }
});

/* ----- GET all users in a specific hobby group ----- */
userRouter.get("/members/:hobby", auth, async (req, res) => {
  try {
    const hobby = req.params.hobby;
    const users = await User.find({
      hobbies: { $regex: new RegExp(`^${hobby}$`, "i") } // Exact match, case-insensitive
    }).select("username profileImage hobbies lastActive");

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ----- PUT request to update lastActive ----- */
userRouter.patch("/update-last-active", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId, { lastActive: new Date() }, { new: true });
    console.log(`Updated lastActive for user ${userId}:`, user.lastActive);
    return res.json(user);
  } catch (err) {
    console.error("Error updating lastActive:", err);
    return res.status(500).json({ message: err.message });
  }
});

/* --------------- MESSAGES --------------- */

/* ----- GET messages for a specific private chat room ----- */
userRouter.get("/private-messages/:roomId", auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      roomId: req.params.roomId
    })
      .populate('userId', 'username profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ----- GET all private conversations for a user (WhatsApp-style list) ----- */
userRouter.get("/:id/private-messages", auth, isUser, async (req, res) => {
  try {
    // 1. Get all private messages involving this user
    const allMessages = await ChatMessage.find({
      $or: [
        { userId: req.params.id, isPrivate: true },
        { recipientId: req.params.id, isPrivate: true }
      ]
    })
      .populate('userId', 'username profileImage')
      .populate('recipientId', 'username profileImage')
      .sort({ createdAt: -1 });

    // 2. Group messages by conversation (roomId)
    const conversations = {};

    allMessages.forEach(message => {
      const roomId = message.roomId;

      // If this is a new conversation, initialize it
      if (!conversations[roomId]) {
        // Determine who the other user is
        const otherUser = message.userId._id.toString() === req.params.id
          ? message.recipientId
          : message.userId;

        conversations[roomId] = {
          roomId: roomId,
          otherUser: {
            _id: otherUser._id,
            username: otherUser.username,
            profileImage: otherUser.profileImage
          },
          messages: [],
          lastMessage: null,
        };
      }

      // Add message to conversation
      conversations[roomId].messages.push(message);

      // Update last message if this is newer
      if (!conversations[roomId].lastMessage ||
        message.createdAt > conversations[roomId].lastMessage.createdAt) {
        conversations[roomId].lastMessage = {
          content: message.content,
          isMine: message.userId._id.toString() === req.params.id,
          createdAt: message.createdAt
        };
      }
    });

    // 3. Convert to array and sort by most recent
    const conversationList = Object.values(conversations).sort((a, b) =>
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json(conversationList);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ----- POST send private message ----- */
userRouter.post("/:id/send-private-message", auth, isUser, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    // Create consistent roomId regardless of who initiates
    const participants = [req.params.id, recipientId].sort();
    const roomId = `private_${participants[0]}_${participants[1]}`;

    const message = new ChatMessage({
      roomId: roomId,
      userId: req.params.id,
      recipientId: recipientId,
      content,
      isPrivate: true
    });

    await message.save();

    // Populate user data before sending response
    const populatedMessage = await ChatMessage.populate(message, {
      path: 'userId',
      select: 'username profileImage'
    });

    res.json(populatedMessage);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default userRouter;