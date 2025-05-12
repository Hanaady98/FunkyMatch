import JoinRequest from "../models/JoinRequest.schema.js";
import GroupBan from "../models/GroupBan.schema.js";
import ModLog from "../models/ModLog.schema.js";
const getPendingRequests = async (req, res) => {
    try {
        // Get all pending requests
        const requests = await JoinRequest.find({
            status: "pending"
        })
            .populate("userId", "username profileImage")
            .lean();

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (err) {
        console.error("Failed to fetch requests:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch requests",
            error: err.message
        });
    }
};

const manageJoinRequest = async (req, res) => {
    try {
        const { action } = req.body; // "approve" or "reject"
        const { requestId } = req.params;

        const request = await JoinRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Join request not found"
            });
        }

        if (action === "approve") {
            // Add user to group members
            await Group.findByIdAndUpdate(request.groupId, {
                $addToSet: { members: request.userId }
            });

            request.status = "approved";
            await request.save();

            return res.json({
                success: true,
                message: "Request approved"
            });
        }

        if (action === "reject") {
            request.status = "rejected";
            await request.save();

            return res.json({
                success: true,
                message: "Request rejected"
            });
        }

        throw new Error("Invalid action");

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to process request",
            error: err.message
        });
    }
};

const getActiveBans = async (req, res) => {
    try {
        const bans = await GroupBan.find({
            groupId: new RegExp(`^${req.params.groupId}$`, "i"),
            banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).populate("bannedBy", "username");

        res.json({ bans });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const removeBanById = async (req, res) => {
    try {
        const ban = await GroupBan.findByIdAndDelete(req.params.banId);
        if (!ban) {
            return res.status(404).json({
                success: false,
                message: "Ban not found"
            });
        }

        // Create mod log with IP from request
        await ModLog.create({
            action: 'unban',
            moderator: req.user._id,
            targetUser: ban.userId,
            groupId: ban.groupId,
            details: 'Manual removal by moderator',
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: `Ban for user ${ban.userId} removed`,
            unbannedUser: ban.userId
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Invalid ban ID format",
            error: err.message
        });
    }
};

const removeUserBansFromGroup = async (req, res) => {
    try {
        const result = await GroupBan.deleteMany({
            groupId: new RegExp(`^${req.params.groupId}$`, "i"),
            userId: req.params.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No active bans found for this user in the specified group"
            });
        }

        await ModLog.create({
            action: 'unban',
            moderator: req.user._id,
            targetUser: req.params.userId,
            groupId: req.params.groupId,
            details: `Removed ${result.deletedCount} ban(s)`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: `Removed ${result.deletedCount} ban(s)`,
            unbannedUser: req.params.userId
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to remove bans",
            error: err.message
        });
    }
};

export {
    getPendingRequests,
    getActiveBans,
    removeBanById,
    removeUserBansFromGroup,
    manageJoinRequest
};