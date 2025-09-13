import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    avatarBg: {
      type: String,
      required:true
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("users", UserSchema);
