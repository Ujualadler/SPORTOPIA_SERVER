const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    latestMessage:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    }
  },
);


const ChatModel = mongoose.model("Chat", chatSchema);

module.exports = ChatModel;
