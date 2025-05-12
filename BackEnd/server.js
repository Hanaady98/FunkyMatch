/* ------ this is where our server is set up to handle requests and connect to the database ------ */
import express from "express";
import cors from "cors";
import router from "./router/router.js";
import { morganLogger } from "./middlewares/logger.js";
import { badRequest } from "./middlewares/badRequest.js";
import { connectServer } from "./services/db.service.js";
import { seedUsers } from "./users/dataSeed/usersSeed.js";
import { initSocket, getIO } from "./services/socket.service.js";
import { PORT } from "./services/env.service.js";
import path from "path";
import './services/banExpiry.js'; // for automated ban expiry

const app = express();

// middleware to parse JSON, maximum request body size is 5mb
app.use(express.json({ limit: "5mb" }));

/* logger middleware -> is a logging middleware
(like console.log for HTTP requests) */
app.use(morganLogger);

// cors middleware - allow all
app.use(cors());

// static files middleware
app.use(express.static("public"));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// the router to the app
app.use(router);

// middleware to handle 404 errors
app.use(badRequest);

// middleware to handle 500 errors
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).send("Something BROKE !");
});

// Enhanced server startup
const httpServer = app.listen(PORT, async () => {
  console.log(`🚀 HTTP & WebSocket server running on port ${PORT}`);
  try {
    await connectServer();
    await seedUsers();
    console.log('✅ Automated ban expiry system activated');
  } catch (err) {
    console.error("Startup error:", err);
  }
});

// Error handling
httpServer.on('error', (err) => {
  console.error('Server crashed:', err);
  process.exit(1);
});

initSocket(httpServer);

// Socket.IO connection logging
const io = getIO();
io.on("connection", (socket) => {
  console.log(`✅ ${socket.user?.username || 'Unknown'} connected (${socket.id})`);
});