import { Schema, model } from "mongoose";

const ModLogSchema = new Schema({
    action: {
        type: String,
        enum: ['ban', 'unban', 'message_delete', 'request_approval'],
        required: true
    },
    moderator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    groupId: String,
    details: String,
    ipAddress: String
}, { timestamps: true });

ModLogSchema.index({ createdAt: -1 });
export default model("ModLog", ModLogSchema);