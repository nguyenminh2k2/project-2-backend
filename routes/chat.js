const chatController = require ("../controllers/chatController");
const middlewareController = require("../controllers/middlewareController");
const router = require("express").Router();

router.post("/chatroom",middlewareController.verifyToken, chatController.createChatRoom);

router.put("/:chatId",middlewareController.verifyTokenAndUserPostAuthorization, chatController.updateChatRoom);

router.post("/:memberId2", middlewareController.verifyToken, chatController.createChat);

router.get("/:userId", chatController.userChats);

router.get("/find/:firstId/:secondId", chatController.findChat);

router.get("/achat/:chatId", chatController.getAChat);

router.put("/remove/:chatId", middlewareController.verifyTokenAndUserPostAuthorization, chatController.removerMember);

router.put("/add/:chatId", middlewareController.verifyTokenAndUserPostAuthorization, chatController.addMember);

router.delete("/:chatId", middlewareController.verifyTokenAndUserPostAuthorization, chatController.deleteGroup);

router.put("/leave/:chatId", middlewareController.verifyTokenAndUserPostAuthorization, chatController.leaveGroup);

router.get('/members/:chatId', chatController.getMembers);


module.exports = router;