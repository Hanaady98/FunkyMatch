import GroupBan from "../models/GroupBan.schema.js";
import ModLog from "../models/ModLog.schema.js";

const banUserFromGroup = async (req, res) => {
    try {
        const { groupId, userId, duration, reason } = req.body;
        //case sensitive groupId regex
        const caseInsensitiveGroupId = new RegExp(`^${groupId}$`, "i");

        const existingBan = await GroupBan.findOne({
            groupId: caseInsensitiveGroupId,
            userId,
            banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (existingBan) {
            return res.status(400).json({
                message: "User is already banned from this group",
                existingBan
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot ban yourself"
            });
        }

        const newBan = new GroupBan({
            groupId,
            userId,
            bannedBy: req.user._id,
            banDuration: duration,
            banReason: reason
        });

        await newBan.save();

        await ModLog.create({
            action: 'ban',
            moderator: req.user._id,
            targetUser: userId,
            groupId,
            details: reason,
            ipAddress: req.ip
        });

        res.status(200).json(newBan);
    } catch (err) {
        res.status(500).json({
            message: "Ban failed",
            error: err.message
        });
    }
};

const unbanUserFromGroup = async (req, res) => {
    try {
        const { userId, groupId } = req.params;
        const caseInsensitiveGroupId = new RegExp(`^${groupId}$`, "i");

        if (userId === req.user._id.toString()) {
            return res.status(403).json({
                message: "You cannot unban yourself"
            });
        }

        const result = await GroupBan.deleteOne({
            userId,
            groupId: caseInsensitiveGroupId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "No active ban found",
                suggestion: "Check if the user ID and group ID are correct"
            });
        }

        await ModLog.create({
            action: 'unban',
            moderator: req.user._id,
            targetUser: userId,
            groupId,
            details: 'Manual unban',
            ipAddress: req.ip
        });

        res.status(200).json({
            message: "Unban successful",
            details: {
                userId,
                groupId,
                unbannedBy: req.user._id
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Unban failed",
            error: err.message
        });
    }
};

export { banUserFromGroup, unbanUserFromGroup };