const mongoose = require("mongoose");

const postGroupSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    groupId: {
        type: String
    },
    avaUrl: {
      type: String,
    },
    theme: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 4,
    },
    image:{
      type: String,
    },
    
    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostGroup", postGroupSchema);