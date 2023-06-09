const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    name:{
      type: String
    },
    createId:{
      type: String,
      required: true
    },
    messageCount:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatModels", ChatSchema);