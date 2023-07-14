const Post = require("../models/Post");
const User = require("../models/User");
const { cloudinary } = require("../utils/cloudinary");

const postController = {
  //CREATE A POST
  createPost: async (req, res) => {
    try {
      const users = await User.findById(req.user.id);
      if (req.body.imageUrl) {
        const result = await cloudinary.uploader.upload(req.body.imageUrl, {
          upload_preset: "post_image",
        });
        const makePost = {
          ...req.body,
          imageUrl: result.secure_url,
          cloudinaryId: result.public_id,
          userId: users.id,
          username: users.username,
          avaUrl: users.profilePicture,
          theme: users.theme,
        };
        const newPost = new Post(makePost);
        const savedPost = await newPost.save();
        return res.status(200).json(savedPost);
      } else {
        const makePost = {
          ...req.body,
          userId: users.id,
          username: users.username,
          avaUrl: users.profilePicture,
          theme: users.theme,
        };
        const newPost = new Post(makePost);
        const savedPost = await newPost.save();
        return res.status(200).json(savedPost);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  //UPDATE A POST
  updatePost: async (req, res) => {
    if (await checkPermissionModifyPost(req.user.id, req.params.id)) {
      try {
        const post = await Post.findById(req.params.id.trim());
       
          await post.updateOne({ $set: req.body });
          res.status(200).json("Post has been updated");
        
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You're not allowed to do that!");
    }

  },

  //DELETE A POST
  deletePost: async (req, res) => {
    if (await checkPermissionModifyPost(req.user.id, req.params.id)){
      try {
      const post = await Post.findById(req.params.id);
      await Post.findByIdAndDelete(req.params.id);
      if (post.cloudinaryId) {
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }
      res.status(200).json("Delete post succesfully");
    } catch (err) {
      res.status(500).json(err);
    }
    }else {
      res.status(403).json("You're not allowed to do that!");
    }
    
  },

  //GET ALL POST FROM A USER
  getPostsFromOne: async (req, res) => { 
    try {
      const post = await Post.find({ userId: req.params.id });
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  },


  //GET ALL POSTS
  getAllPosts: async (req, res) => {
    try {
      res.status(200).json(res.paginatedResults);
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  //GET A POST
  getAPost: async(req,res) => {
    try{
      const post = await Post.findById(req.params.id); 
      return res.status(200).json(post);
    }catch(err){
      return  res.status(500).json(err);
    }
  }
};


async function checkPermissionModifyPost (userId, postId) {
  const post = await Post.findById(postId);
  // console.log(postId);
  return post?.userId == userId;
}

module.exports = postController;