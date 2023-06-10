const router = require("express").Router();

const postGroupController = require("../controllers/postGroupController");
const middlewareController = require("../controllers/middlewareController");
const PostGroup = require("../models/PostGroup");


// Tạo bài viết trong nhóm
router.post(
    "/:groupId",
    middlewareController.verifyTokenAndUserPostAuthorization, 
    postGroupController.createPostInGroup
);
// update post
router.put(
    "/:groupId/:postId", middlewareController.verifyTokenAndUserPostAuthorization, postGroupController.updatePost
);

// delete post
router.delete(
    "/:groupId/:postId", middlewareController.verifyTokenAndUserPostAuthorization, postGroupController.deleteAPost
)

//GET ALL POSTS
router.get(
    "/:groupId",
    middlewareController.verifyToken,
    middlewareController.paginatedResult(PostGroup),
    postGroupController.getAllPosts
  );

module.exports = router;
