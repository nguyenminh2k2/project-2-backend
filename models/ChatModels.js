const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      required: true
    },
    name:{
      type: String
    },
    createId:{
      type: String,
      
    },
    messageCount:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatModels", ChatSchema);