import { Router } from "express";
import {
    createRequest,
    handleRequest
} from "../../users/controllers/joinRequest.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import isModerator from "../../middlewares/isModerator.js";

const joinRequestRouter = Router();

// User submits request
joinRequestRouter.post("/", auth, createRequest);

// Moderator handles request
joinRequestRouter.patch("/:id", auth, isModerator, handleRequest);

export default joinRequestRouter;