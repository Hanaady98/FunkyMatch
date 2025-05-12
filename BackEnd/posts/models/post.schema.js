import { Schema, model } from "mongoose";

const postSchema = new Schema(
    {
        content: {
            type: String,
            maxlength: 150,
            trim: true
        },
        image: {
            url: {
                type: String,
                required: false
            },
            alt: {
                type: String,
                maxlength: 100,
                default: "Post image"
            }
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        edited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// we add this configuration BEFORE virtuals and model export
postSchema.set('toJSON', {
    virtuals: true,
    versionKey: false, // Removes the __v field
    transform: function (doc, ret) {
        ret.id = ret._id.toString(); // Convert ObjectId to string
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

export default model("Post", postSchema);