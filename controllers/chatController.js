// import ChatModel from "../models/ChatModels.js";
const ChatModel = require("../models/ChatModels");


const chatController = {
    createChat : async (req, res) =>{
        const newChat = new ChatModel({
            members: [req.body.senderId, req.body.receiverId],
        });

        try{
            const resul = await newChat.save();
            res.status(200).json(resul);
        }catch (error){
            res.status(500).json(error);
        }
    },
    createChatRoom: async (req, res) => {
        const members = req.body.members; // Mảng chứa các thành viên tham gia chat
        const newChat = new ChatModel({ 
            members,
            name: req.body.name ,
            createId: req.body.createId
        });
      
        try {
          const result = await newChat.save();
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json(error);
        }
      },

    updateChatRoom: async (req, res) => {
        const chatId = req.params.chatId; // The ID of the chat room to update
        const senderId = req.body.senderId; // The ID of the person making the update
        const newName = req.body.name; // The new name for the chat room
        const membersToAdd = req.body.membersToAdd; // An array of member IDs to add
        const membersToRemove = req.body.membersToRemove; // An array of member IDs to remove
      
        try {
          // Find the chat room by ID
          const chat = await ChatModel.findById(chatId);
      
          // Check if the person making the update is the creator
          if (!chat.members.includes(senderId)) {
            return res.status(403).json({ error: "You are not a member of this chat room." });
          }
      
          // Update the name if a new name is provided
          if (chat.createId === senderId && newName) {
            chat.name = newName;
          }
          // Add new members to the chat room
          if (membersToAdd && membersToAdd.length > 0) {
            chat.members = [...new Set([...chat.members, ...membersToAdd])];
          }
      
          // Remove members from the chat room
          if (chat.createId === senderId && membersToRemove && membersToRemove.length > 0) {
            chat.members = chat.members.filter((member) => !membersToRemove.includes(member));
          }
      
          // Save the updated chat room
          const result = await chat.save();
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json(error);
        }
    },
      
      

    userChats: async (req, res) => {
        try{
            const chat = await ChatModel.find({
                members: {$in: [req.params.userId]}
            });
            res. status(200).json(chat);
        }catch (error){
            res.status(500).json(error);
        }
    },

    findChat: async (req, res) => {
        try{
            const chat = await ChatModel.findOne({
                members: {$all: [req.params.firstId, req.params.secondId]}
            });
            res. status(200).json(chat);
        }catch (error){
            res.status(500).json(error);
        }
    },

      //GET A POST
    getAChat: async(req,res) => {
        try{
            const chat = await ChatModel.findById(req.params.chatId); 
            res.status(200).json(chat);
        }catch(err){
            return  res.status(500).json(err);
        }
    },
};

async function checkPermissionModifyPost (userId, chatId) {
    const chat = await ChatModel.findById(chatId);
    // console.log(postId);
    return chat?.createId == senderId;
  }

module.exports = chatController;
