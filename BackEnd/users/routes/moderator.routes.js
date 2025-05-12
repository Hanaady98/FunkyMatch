import { Router } from "express";
import {
    getPendingRequests,
    getActiveBans,
    removeBanById,
    removeUserBansFromGroup,
    manageJoinRequest
} from "../controllers/moderator.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import isModerator from "../../middlewares/isModerator.js";
import { banUserFromGroup } from "../controllers/groupBan.controller.js";

const moderationRouter = Router();

/*======= Request Management Routes ========*/

/* GET /moderation/requests */
// - Retrieves all pending join requests for moderator review.
moderationRouter.get("/requests", auth, isModerator, getPendingRequests);

/* PATCH /moderation/requests/:requestId */
// - Approves or rejects a specific join request.
// - Request body typically includes { status: "approved" | "rejected", reason?: string }
moderationRouter.patch("/requests/:requestId", auth, isModerator, manageJoinRequest);

/*============ Ban Management Routes =============*/

/* GET /moderation/bans/:groupId */
// - Fetches all active bans for a specific group.
moderationRouter.get("/bans/:groupId", auth, isModerator, getActiveBans);

/* POST /moderation/group-ban */
// - Applies a new ban on a user within a group.
// - Request body includes details like groupId, userId, banDuration, and reason.
moderationRouter.post("/group-ban", auth, isModerator, banUserFromGroup);

/* DELETE /moderation/ban/:banId */
// - Removes a specific ban by its ID.
moderationRouter.delete("/ban/:banId", auth, isModerator, removeBanById);

/* DELETE /moderation/bans/:groupId/user/:userId */
// - Removes all bans for a specific user in a specific group.
// - Useful when unbanning a user entirely from a group.
moderationRouter.delete("/bans/:groupId/user/:userId", auth, isModerator, removeUserBansFromGroup);

export default moderationRouter;
