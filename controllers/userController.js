const User = require("../models/User");
// const Post = require("../models/Post");
// const Comment = require("../models/Comment");
// const Message = require("../models/Message");
const bcrypt = require("bcrypt");
const authController = require("./authController");

const userController = {
//Get all user from a chat
getUserFromOneChat: async (req,res) => {
  try{
      const user = await User.find({ ChatId: req.params.id });
      res.status(200).json(user);
  }
  catch{
      res.status(500).json(err);
  }
  

},

  // Get a User
getUser : async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such User");
    }
    } catch (error) {
      res.status(500).json(error);
    }
},

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
          await User.findByIdAndUpdate(
            req.user.id,
            {
              $push: { followings: req.params.id },
            },
            { returnDocument: "after" }, 
            { password: 0 }        
          );
          return res.status(200).json("follow successfully!");
        } else {
          // unfollow
          await User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.user.id },
          });
          await User.findByIdAndUpdate(
            req.user.id,
            {
              $pull: { followings: req.params.id },
            },
            { returnDocument: "after" },
            { password: 0 }
          );
          // const { password, ...others } = user._doc;
          return res.status(200).json("unfollow successfully!");
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