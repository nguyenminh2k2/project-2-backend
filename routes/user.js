const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");
const router = require("express").Router();

// GET A USER
router.get('/:id', userController.getUser);

//GET ALL USERS
router.get("/", middlewareController.verifyToken, userController.getAllUsers);

//DELETE USER
router.delete("/:id", middlewareController.verifyTokenAndUserAuthorization, userController.deleteUser);

//FOLLOW A USER
router.put(
  "/:id/follow",
  middlewareController.verifyToken,
  userController.followUser
);

// Get Followers
router.get("/followers/:userId", middlewareController.verifyToken, userController.getFollowers);

// Get Followings
router.get("/followings/:userId", middlewareController.verifyToken, userController.getFollowings);

module.exports = router;