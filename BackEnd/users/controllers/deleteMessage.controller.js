import ChatMessage from "../../models/ChatMessage.schema.js";
import ModLog from "../models/ModLog.schema.js";
import { Types } from "mongoose";

const deleteMessage = async (req, res) => {
    try {
        const { messageId, roomId } = req.body;

        if (!messageId || !roomId) {
            return res.status(400).json({
                success: false,
                message: "Both messageId and roomId are required"
            });
        }

        if (!Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid messageId format"
            });
        }

        const message = await ChatMessage.findOne({
            _id: messageId,
            // case sensitive roomId regex
            roomId: new RegExp(`^${roomId}$`, "i")
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found in specified room"
            });
        }

        await ChatMessage.deleteOne({ _id: messageId });

        await ModLog.create({
            action: 'message_delete',
            moderator: req.user._id,
            targetUser: message.userId,
            groupId: roomId,
            details: `Deleted message: ${message.content.substring(0, 20)}...`,
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: "Message deleted",
            data: {
                messageId,
                roomId,
                deletedBy: req.user._id
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: err.message
        });
    }
};

export default deleteMessage;