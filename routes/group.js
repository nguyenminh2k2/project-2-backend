const groupController = require ("../controllers/groupController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

//create group
router.post("/", middlewareController.verifyToken,groupController.createGroup);

//get all Group
router.get("/allGroup", groupController.getAllGroup);

//get a Group
router.get("/aGroup/:groupId", groupController.getAGroup);

// Get groups from user
router.get("/:userId", groupController.userGroups);

//update group
router.put("/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.updateGroup);

//delete group
router.delete("/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.daleteGroup);

//get members
router.get('/members/:groupId', groupController.getMembers);

router.get("/pendingMembers/:groupId", groupController.getPendingMembers);

// remove members
router.put("/remove/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.removerMember);

// add members
router.put("/add/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.addMember);

// leave group
router.put("/leave/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.leaveGroup);

// join group
router.put("/join/:groupId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.joinGroup);

// Admin accept
router.put("/accept/:groupId/:requestId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.approveRequest);

// admin từ chối
router.put("/refuse/:groupId/:requestId", middlewareController.verifyTokenAndUserPostAuthorization, groupController.refuseRequest);

module.exports = router;
