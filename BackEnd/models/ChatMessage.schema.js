import { Schema, model } from "mongoose";

const chatMessageSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isPrivate;
      },
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    // For private chats
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// indexes for better performance
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ recipientId: 1 });

export default model("ChatMessage", chatMessageSchema);
