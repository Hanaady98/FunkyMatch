import JoinRequest from "../models/JoinRequest.schema.js";
import GroupBan from "../models/GroupBan.schema.js";

const createRequest = async (req, res) => {
    try {
        const { groupId } = req.body;
        const userId = req.user._id;
        const caseInsensitiveGroupId = new RegExp(`^${groupId}$`, "i");

        // Check active ban
        const activeBan = await GroupBan.findOne({
            groupId: caseInsensitiveGroupId,
            userId,
            banStartDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (activeBan) {
            const expiry = activeBan.banDuration === "permanent" ?
                "Permanent" :
                new Date(activeBan.banStartDate.getTime() +
                    (activeBan.banDuration === "1h" ? 3600000 :
                        activeBan.banDuration === "24h" ? 86400000 : 604800000));

            return res.status(403).json({
                message: "Active ban prevents joining",
                banDetails: { reason: activeBan.banReason, expires: expiry }
            });
        }

        // Create using new static method
        const request = await JoinRequest.createRequest(userId, groupId);

        res.status(201).json({
            success: true,
            request: {
                _id: request._id,
                groupId: request.groupId,
                status: request.status,
                createdAt: request.createdAt
            }
        });

    } catch (err) {
        const status = err.message === 'PENDING_REQUEST_EXISTS' ? 403 :
            err.message === 'REQUEST_COOLDOWN_ACTIVE' ? 429 : 500;

        res.status(status).json({
            success: false,
            message: err.message.includes('_') ?
                err.message.replace(/_/g, ' ').toLowerCase() :
                'Request creation failed',
            error: err.message
        });
    }
};

const handleRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const moderatorId = req.user._id;

        const request = await JoinRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (status === "approved") {
            await request.approve(moderatorId);
            const { deletedCount } = await GroupBan.deleteMany({
                groupId: new RegExp(`^${request.groupId}$`, "i"),
                userId: request.userId
            });

            return res.json({
                success: true,
                message: "Request approved",
                bansRemoved: deletedCount
            });
        }

        if (status === "rejected") {
            await request.reject(moderatorId, reason);
            return res.json({
                success: true,
                message: "Request rejected",
                // reason: request.reason,
                cooldownExpiry: request.cooldownExpiry
            });
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Request processing failed",
            error: err.message
        });
    }
};

export { createRequest, handleRequest };