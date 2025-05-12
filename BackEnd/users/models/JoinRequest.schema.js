import { Schema, model } from "mongoose";

const JoinRequestSchema = new Schema({
    groupId: {
        type: String,
        required: true,
        index: true,
        match: /^[a-z0-9-]+$/i
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "cooldown"],
        default: "pending"
    },
    handledBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        validate: {
            validator: function (v) {
                return !(this.status !== 'pending' && !v);
            },
            message: 'Moderator reference required'
        }
    },
    handledDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !(this.handledBy && !v);
            }
        }
    },
    rejectionReason: {
        type: String,
        maxlength: 200,
        required: function () {
            return this.status === 'rejected';
        }
    },
    cooldownExpiry: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true,
    statics: {
        async checkEligibility(userId, groupId) {
            const now = new Date();
            const existing = await this.findOne({
                userId,
                groupId,
                $or: [
                    { status: 'pending' },
                    {
                        status: 'rejected',
                        cooldownExpiry: { $gt: now }
                    }
                ]
            });
            if (existing) throw new Error(existing.status === 'pending' ?
                'PENDING_REQUEST_EXISTS' : 'REQUEST_COOLDOWN_ACTIVE');
            return true;
        },
        async createRequest(userId, groupId) {
            await this.checkEligibility(userId, groupId);
            return this.create({ userId, groupId });
        }
    },
    methods: {
        approve(moderatorId) {
            this.status = 'approved';
            this.handledBy = moderatorId;
            this.handledDate = new Date();
            return this.save();
        },
        reject(moderatorId, reason) {
            this.status = 'rejected';
            this.handledBy = moderatorId;
            this.handledDate = new Date();
            this.rejectionReason = reason;
            this.cooldownExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            return this.save();
        }
    }
});

JoinRequestSchema.index({ userId: 1, groupId: 1, status: 1 });
export default model("JoinRequest", JoinRequestSchema);