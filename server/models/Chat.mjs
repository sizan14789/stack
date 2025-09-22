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
      default: "Say Hi to start a conversation"
    }
  },
  { timestamps: true }
);

export default mongoose.model('chats', ChatSchema);