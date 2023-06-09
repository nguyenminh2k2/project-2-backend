const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
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
      required: true
    },
    type:{
      type: Boolean,
      required: true
    },
    pendingMembers: {
      type: Array
    },
    isAdminApproved: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);