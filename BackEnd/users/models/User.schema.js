import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9]+$/, "Username must be alphanumeric"],
    },
    name: {
      first: { type: String, required: true, minlength: 2, maxlength: 256 },
      last: { type: String, required: true, minlength: 2, maxlength: 256 },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
        "Please provide a valid email",
      ],
    },
    password: { type: String, required: true },
    profileImage: {
      url: { type: String, default: "" },
      alt: { type: String, default: "" }
    },
    address: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    hobbies: {
      type: [String],
      required: true,
      index: true,
      validate: [
        {
          validator: function (v) {
            return v.length >= 1;
          },
          message: "You must have at least 1 hobby"
        },
        {
          validator: function (v) {
            return v.length <= 15;
          },
          message: "You can have up to 15 hobbies maximum"
        }
      ]
    },
    lastActive: { type: Date, default: Date.now },
    bio: { type: String, required: true },
    isModerator: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model("User", userSchema);