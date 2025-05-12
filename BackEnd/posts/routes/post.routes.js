import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createPost,
  getPostsByUser,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLike
} from "../services/postsDataAccess.service.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.js";
import { isRegisteredUser } from "../../middlewares/isRegisteredUser.js";
import { isUser } from "../../middlewares/isUser.js";
import { validate } from "../../middlewares/validation.js";
import { PostCreationSchema } from "../validations/PostCreationSchema.js";

const postRouter = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/posts';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create Multer middleware instance
const postUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* -------- CREATE POST -------- */
postRouter.post("/", auth, postUpload.single('file'),
  async (req, res, next) => {
    try {
      if (req.file) {
        req.body.image = {
          url: `http://localhost:8181/uploads/posts/${req.file.filename}`,
          alt: req.body.alt || "User uploaded image"
        };
      }

      req.body.userId = req.user._id.toString();
      next();
    } catch (err) {
      console.error("Upload processing error:", err);
      res.status(500).json({ message: "Error processing file upload" });
    }
  },
  validate(PostCreationSchema),
  async (req, res) => {
    try {
      const postData = {
        content: req.body.content,
        image: req.body.image,
        userId: req.body.userId
      };

      const newPost = await createPost(postData);
      res.status(201).json(newPost);
    } catch (err) {
      console.error("Post creation error:", err);
      res.status(400).json({
        message: err.message || "Failed to create post"
      });
    }
  }
);

/* -------- GET ALL POSTS (Admin only) -------- */
postRouter.get("/", auth, isAdmin, async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- GET USER'S POSTS (Authenticated) -------- */
postRouter.get("/user/:id", auth, isUser, async (req, res) => {
  try {
    const posts = await getPostsByUser(req.params.id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- GET USER'S POSTS (Public) -------- */
postRouter.get("/public/user/:id", async (req, res) => {
  try {
    const posts = await getPostsByUser(req.params.id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- EDIT POST -------- */
postRouter.put("/:id", auth, isRegisteredUser(true), postUpload.single('file'), async (req, res) => {
  try {
    const updateData = {
      content: req.body.content,
      edited: true
    };
    if (req.file) {
      updateData.image = {
        url: `http://localhost:8181/uploads/posts/${req.file.filename}`,
        alt: req.body.alt || "User uploaded image"
      };
    } else if (req.body.removeImage === 'true') {
      updateData.image = null;
    }

    const updatedPost = await updatePost(req.params.id, updateData);
    res.json(updatedPost);
  } catch (err) {
    console.error("Post update error:", err);
    res.status(400).json({
      message: err.message || "Failed to update post"
    });
  }
});

/* -------- DELETE POST -------- */
postRouter.delete("/:id", auth, isRegisteredUser(true), async (req, res) => {
  try {
    const result = await deletePost(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------- TOGGLE LIKE -------- */
postRouter.patch("/:id", auth, async (req, res) => {
  try {
    const updatedPost = await toggleLike(req.params.id, req.user._id);
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default postRouter;