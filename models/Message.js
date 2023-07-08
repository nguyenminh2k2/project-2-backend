const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
    senderName:{
      type: String
    },
    senderProfile:{
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);