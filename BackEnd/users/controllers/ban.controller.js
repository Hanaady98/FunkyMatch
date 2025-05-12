import UserBan from "../models/UserBanSchema.js";
import { getIO } from "../../services/socket.service.js";
import User from "../models/User.schema.js";
/**
 * Ban a user
 * POST /admin/ban
 * Requires: auth, isAdmin
 * Body: { userId, duration, reason? }
 */
export const banUser = async (req, res) => {
    try {
        const { userId, duration, reason } = req.body;
        const adminId = req.user._id;

        // 1. Validation
        if (!userId || !duration) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate duration
        const validDurations = ["1h", "24h", "1w", "permanent"];
        if (!validDurations.includes(duration)) {
            return res.status(400).json({
                message: "Invalid ban duration. Valid options: 1h, 24h, 1w, permanent"
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Create ban record
        const ban = new UserBan({
            userId,
            bannedBy: adminId,
            banDuration: duration,
            banReason: reason || "Violation of community guidelines"
        });

        await ban.save();

        // Set isBanned to true
        user.isBanned = true;
        await user.save();

        // 3. Real-time handling
        const io = getIO();

        // Notify banned user
        io.to(userId).emit('accountBanned', {
            reason: ban.banReason,
            expiry: duration === "permanent" ? "permanent" : duration
        });

        // Force disconnect if online
        io.sockets.sockets.forEach(socket => {
            if (socket.user?._id.toString() === userId) {
                socket.disconnect(true);
            }
        });

        // 4. Response
        res.status(201).json({
            message: `User ${user.username} banned successfully`,
            ban: {
                _id: ban._id,
                userId: ban.userId,
                bannedBy: adminId,
                banDuration: ban.banDuration,
                banReason: ban.banReason,
                banStartDate: ban.banStartDate
            }
        });

    } catch (error) {
        console.error("Ban error:", error);
        res.status(500).json({
            message: "Failed to ban user",
            error: error.message
        });
    }
};

/**
 * Unban a user
 * DELETE /admin/ban/:userId
 * Requires: auth, isAdmin
 */
export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Remove active bans (from last 7 days)
        const result = await UserBan.deleteMany({
            userId,
            banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Set isBanned to false
        user.isBanned = false;
        await user.save();

        // 3. Response
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "No active bans found for this user"
            });
        }

        res.json({
            message: `User ${user.username} unbanned successfully`,
            unbannedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Unban error:", error);
        res.status(500).json({
            message: "Failed to unban user",
            error: error.message
        });
    }
};

/**
 * Get user's ban history
 * GET /admin/bans/:userId
 * Requires: auth, isAdmin
 */
export const getUserBans = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Get ban history (last 30 days)
        const bans = await UserBan.find({
            userId,
            banStartDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
            .sort({ banStartDate: -1 })
            .populate('bannedBy', 'username profileImage')
            .lean();

        // 3. Format response
        const formattedBans = bans.map(ban => ({
            ...ban,
            isActive: isBanActive(ban)
        }));

        res.json({
            userId,
            username: user.username,
            banCount: bans.length,
            bans: formattedBans
        });

    } catch (error) {
        console.error("Get bans error:", error);
        res.status(500).json({
            message: "Failed to get ban history",
            error: error.message
        });
    }
};

// Helper function to check if ban is active
function isBanActive(ban) {
    if (ban.banDuration === "permanent") return true;

    const expiry = new Date(
        ban.banStartDate.getTime() +
        (ban.banDuration === "1h" ? 3600000 :
            ban.banDuration === "24h" ? 86400000 :
                604800000) // 1 week
    );

    return expiry > new Date();
}