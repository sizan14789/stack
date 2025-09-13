import mongoose from "mongoose";

const ChatSchema = mongoose.Schema(
  {
    participants: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users",
        required: true 
      }
    ],
    groupChat: {
      type: Boolean,
      default: false,
    },
    lastText: {
      type: String,
      required: true,
      default: "Say hi to start a conversation"
    }
  },
  { timestamps: true }
);

export default mongoose.model('chats', ChatSchema);