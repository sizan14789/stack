import mongoose from "mongoose";

const PendingUserSchema = mongoose.Schema(
  {
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
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model("pending-users", PendingUserSchema);
