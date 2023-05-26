const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");
const router = require("express").Router();
// const {
//   verifyToken,
//   verifyTokenAndAdmin,
//   verifyTokenAndUserAuthorization,
// } = require("../controllers/middlewareController");

// GET A USER
router.get('/:id', userController.getUser);

//GET ALL USERS
router.get("/", middlewareController.verifyToken, userController.getAllUsers);

// //DELETE USER
router.delete("/:id", middlewareController.verifyTokenAndUserAuthorization, userController.deleteUser);



//FOLLOW A USER
router.put(
  "/:id/follow",
  middlewareController.verifyToken,
  userController.followUser
);

module.exports = router;