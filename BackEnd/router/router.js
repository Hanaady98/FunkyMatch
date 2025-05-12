import { Router } from "express";
import userRouter from "../users/routes/user.routes.js";
import postRouter from "../posts/routes/post.routes.js";
import { auth } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import path from "path";
import { upload } from "../middlewares/upload.js";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import multer from 'multer';
import moderationRouter from "../users/routes/moderator.routes.js";
import joinRequestRouter from "../users/routes/joinRequest.routes.js";

const router = Router();

const registerUploadDest = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/register-temp';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `reg-${uuidv4()}${ext}`);
  }
});

const registerUpload = multer({
  storage: registerUploadDest,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
// ===== END OF NEW CONFIG ===== //

router.get("/", (req, res) => {
  throw new Error(`This Is An Error`);
});

router.get("/log/:date", auth, isAdmin, (req, res) => {
  try {
    const { date } = req.params;
    return res.sendFile(path.join(process.cwd(), "logs", `${date}.txt`));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  };
});

//
router.post("/upload/register", registerUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:8181/uploads/register-temp/${req.file.filename}`;
    return res.json({ fileUrl });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
/* ===== END OF NEW ROUTE ===== */

router.post("/upload", auth, upload, async (req, res) => {
  try {
    return res.json({ message: "File uploaded", file: req.fileName });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  };
});

router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/moderator", moderationRouter);
router.use("/join-requests", joinRequestRouter);


export default router;