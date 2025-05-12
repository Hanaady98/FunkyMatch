import { Schema, model } from "mongoose";


const GroupBanSchema = new Schema({
    groupId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bannedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    banDuration: {
        type: String,
        enum: ["1h", "24h", "1w", "permanent"],
        required: true
    },
    banReason: { type: String, default: "Violation of group rules" },
    banStartDate: { type: Date, default: Date.now }
}, { timestamps: true });

GroupBanSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupBanSchema.index({ banStartDate: -1 });

export default model("GroupBan", GroupBanSchema);