const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const bcrypt = require("bcrypt");
const authController = require("./authController");

const userController = {
  //GET ALL USER
  getAllUsers: async (req, res) => {
    try {
      const user = await User.find({}, { password: 0 });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //DELETE A USER
  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Delete successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },


  //FOLLOW A USER
  followUser: async (req, res) => {
    if (req.user.id !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        //If user not follow yet
        if (!user.followers.includes(req.user.id)) {
          await User.findByIdAndUpdate(req.params.id, {
            $push: { followers: req.user.id },
          });
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
              $push: { followings: req.params.id },
            },
            { returnDocument: "after" }, 
            { password: 0 }        
          );
          const { password, ...others } = user._doc;
          return res.status(200).json({ ...others });
        } else {
          // unfollow
          await User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.user.id },
          });
          const updateUser = await User.findByIdAndUpdate(
            req.user.id,
            {
              $pull: { followings: req.params.id },
            },
            { returnDocument: "after" },
            { password: 0 }
          );
          const { password, ...others } = user._doc;
          return res.status(200).json({ ...others });
        }
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can't follow yourself");
    }
  },
};

module.exports = userController;