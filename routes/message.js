const messageController = require ("../controllers/messageController");

const router = require("express").Router();

router.post("/",messageController.addMessage);
router.get("/:chatId", messageController.getMessages);
router.get("/sender/:messageId", messageController.getSenderName);

module.exports = router;