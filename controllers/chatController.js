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
};

module.exports = chatController;
