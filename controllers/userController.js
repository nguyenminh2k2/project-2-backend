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

  //UPDATE A USER
  updateUser: async (req, res) => {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id.trim(),
        {
          $set: req.body,
        },
        { returnDocument: "after" }
      ).select("+password");
      const accessToken = await authController.generateAccessToken(user);
      if (req.body.profilePicture || req.body.theme) {
        try {
          await Post.updateMany(
            { userId: req.params.id },
            {
              $set: { avaUrl: req.body.profilePicture, theme: req.body.theme },
            }
          );
          await Comment.updateMany(
            { ownerId: req.params.id },
            {
              $set: { avaUrl: req.body.profilePicture, theme: req.body.theme },
            }
          );
        } catch (err) {
          return res.status(500).json(err);
        }
      }
      const returnedUser = {
        ...user._doc,
        accessToken: accessToken,
      };
      res.status(200).json(returnedUser);
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