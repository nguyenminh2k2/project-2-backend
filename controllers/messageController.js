const Message = require("../models/Message");
const User = require("../models/User");

const messageController = {
    addMessage : async (req, res) => {
        const { chatId, senderId, text } = req.body;

        try {
          const sender = await User.findById(senderId).select("username profilePicture");
          const message = new Message({
            chatId,
            senderId,
            senderName: sender.username,
            senderProfile: sender.profilePicture,
            text,
          });          
          const result = await message.save();
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json(error);
        }
      },

      getSenderName : async (req, res) => {
        const {messageId} = req.params;
        try {
          const result = await Message.findById({ _id: messageId}).select("senderId");

          if (!result) {
            return res.status(404).json({ error: 'Chat not found' });
          }
          const member = result.senderId;
          const members = await User.find({ _id: { $in: member } }).select('id username profilePicture'); // Truy vấn thông tin người dùng dựa trên các ID
          
          res.status(200).json({ members });
        }catch (error) {
          res.status(500).json(error);
        }
      },

      getMessages : async (req, res) => {
        const { chatId } = req.params;
        try {
          const result = await Message.find({ chatId });
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json(error);
        }
      },
}
module.exports = messageController;
