const chatController = require ("../controllers/chatController");

const router = require("express").Router();

router.post("/",chatController.createChat);
router.get("/:userId", chatController.userChats);
router.get("/find/:firstId/:secondId", chatController.findChat);

module.exports = router;