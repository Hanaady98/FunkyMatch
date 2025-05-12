import { Schema, model } from "mongoose";

const UserBanSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bannedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    banStartDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    banDuration: {
        type: String,
        enum: ["1h", "24h", "1w", "permanent"],
        required: true
    },
    banReason: {
        type: String,
        default: "Violation of community guidelines"
    }
}, { timestamps: true });

export default model("UserBan", UserBanSchema);