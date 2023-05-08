const router = require("express").Router();
const Post = require("../models/Post");
// const commentController = require("../controllers/commentController");
const middlewareController = require("../controllers/middlewareController");
const postController = require("../controllers/postController");
const upload = require("../utils/multer");

//CREATE A POST
router.post(
  "/",
  upload.single("image"),
  middlewareController.verifyToken,
  postController.createPost
);

//UPDATE A POST
router.put(
  "/:id",
  middlewareController.verifyTokenAndUserPostAuthorization,
  postController.updatePost
);

//DELETE A POST
router.delete(
  "/:id",
  middlewareController.verifyTokenAndUserPostAuthorization,
  postController.deletePost
);

//GET ALL POST FROM A USER
router.get(
  "/user/:id",
  middlewareController.verifyToken,
  postController.getPostsFromOne
);

//GET A POST
router.get(
  "/fullpost/:id", 
  middlewareController.verifyToken, 
  postController.getAPost
);

//GET ALL POSTS
router.get(
  "/",
  middlewareController.verifyToken,
  middlewareController.paginatedResult(Post),
  postController.getAllPosts
);

module.exports = router;
