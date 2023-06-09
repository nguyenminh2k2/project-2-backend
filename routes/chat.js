const chatController = require ("../controllers/chatController");

const router = require("express").Router();

router.post("/chatroom", chatController.createChatRoom);
router.put("/:chatId", chatController.updateChatRoom);
router.post("/",chatController.createChat);
router.get("/:userId", chatController.userChats);
router.get("/find/:firstId/:secondId", chatController.findChat);
router.get("/achat/:chatId", chatController.getAChat);

module.exports = router;