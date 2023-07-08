const ChatModel = require("../models/ChatModels");
const User = require("../models/User");


const chatController = {
  // create chat 2 people
    createChat : async (req, res) =>{
        const users = await User.findById(req.user.id);
        const memberId1 = users.id;
        const memberId2 = req.body.member;
          // Kiểm tra xem phòng chat với hai thành viên đã tồn tại hay chưa
        const existingChat = await ChatModel.findOne({
          members: { $all: [memberId1, memberId2], $size: 2 } 
        });
        if (existingChat) {
          return res.status(403).json({ error: 'Phòng chat đã tồn tại' }); 
        }
        else{
          const newChat = new ChatModel({ 
            members: [memberId1, memberId2]
          });
        
          try{
              const resul = await newChat.save();
              res.status(200).json(resul);
          }catch (error){
              res.status(500).json(error);
          }
        }    
    },

    // create chat group
    createChatRoom: async (req, res) => {
      const users = await User.findById(req.user.id);
      const currentUser = users.id;
      const memberUsernames = req.body.members;
    
      try {
        const members = []; // Danh sách thành viên cuối cùng
        const memberIds = []; // Mảng tạm thời để lưu ID của thành viên duy nhất
    
        for (const username of memberUsernames) {
          if (username !== users.username) {
            const user = await User.findOne({ username }); // Tìm kiếm người dùng dựa trên tên người dùng
            if (user && !memberIds.includes(user.id)) {
              memberIds.push(user.id); // Thêm ID người dùng vào mảng tạm thời nếu chưa tồn tại
            }
          }
        }
    
        members.push(currentUser, ...memberIds); // Thêm ID các thành viên duy nhất vào danh sách thành viên
    
        if (members.length <= 2) {
          return res.status(403).json({ error: "members > 2 is true" });
        }
    
        const newChat = new ChatModel({ 
          members,
          name: req.body.name,
          createId: currentUser
        });
    
        const result = await newChat.save();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json(error);
      }
    },
        
    updateChatRoom: async (req, res) => {
      try {
        if (await checkPermissionModifyGroup(req.user.id, req.params.chatId)) {
          const update = await ChatModel.findByIdAndUpdate(
            req.params.chatId.trim(),
            { $set: req.body },
            { new: true }
          );
          res.status(200).json(update);
        } else {
          res.status(403).json("You're not the admin of this group");
        }
      } catch (err) {
        res.status(500).json(`ERROR: ${err}`);
      }
    },

    getMembers: async (req, res) => {
      try {
        const chatId = req.params.chatId; // Lấy chatId từ tham số của API (hoặc thông qua req.body, req.query tùy vào cách bạn thiết kế API)
        const chat = await ChatModel.findById(chatId).select('members'); // Tìm chat dựa trên chatId và chỉ lấy trường 'members' (chứa các ID của thành viên)
        
        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
    
        const memberIds = chat.members; // Lấy danh sách ID của thành viên từ chat
        const members = await User.find({ _id: { $in: memberIds } }).select('id username profilePicture'); // Truy vấn thông tin người dùng dựa trên các ID
    
        res.status(200).json({ members });
      } catch (error) {
        res.status(500).json(error);
      }
    },
    

     // Xóa thành viên
     removerMember: async (req, res) => {
      if (await checkPermissionModifyGroup(req.user.id, req.params.chatId)) {
        const membersToRemoveUsernames = req.body.membersToRemove; // Mảng chứa tên người dùng của thành viên cần xóa
    
        try {
          const chat = await findChatRoomById(req.params.chatId);
    
          const updatedMembers = [];
          for (const memberId of chat.members) {
            const member = await User.findById(memberId);
            if (!membersToRemoveUsernames.includes(member.username)) {
              updatedMembers.push(memberId);
            }
          }
    
          chat.members = updatedMembers;
          await chat.save();
    
          res.status(200).json("Remove member successfully!");
        } catch (err) {
          res.status(500).json(`ERROR: ${err}`);
        }
      } else {
        res.status(403).json("You're not the admin of this group");
      }
    },    
     
    addMember: async (req, res) => {
      if (await checkMemberFromGroup(req.user.id, req.params.chatId)) {
        const membersToAddUsernames = req.body.membersToAdd; // Mảng chứa tên người dùng của thành viên cần thêm
    
        try {
          const chat = await findChatRoomById(req.params.chatId);
          const existingMembers = new Set(chat.members); // Sử dụng Set để lưu trữ các thành viên hiện có
    
          for (const username of membersToAddUsernames) {
            const user = await findUserByUsername(username);
            if (user && !existingMembers.has(user.id)) {
              chat.members.push(user.id); // Thêm ID người dùng vào danh sách thành viên nếu chưa tồn tại
              existingMembers.add(user.id); // Cập nhật Set với ID người dùng đã được thêm
            }
          }
    
          await chat.save();
    
          res.status(200).json("Add member successfully!");
        } catch (err) {
          res.status(500).json(`ERROR: ${err}`);
        }
      } else {
        res.status(403).json("You're not a member of this group");
      }
    },
    
  // xóa nhóm chat
  deleteGroup: async (req, res) => {
      if (await checkPermissionModifyGroup(req.user.id, req.params.chatId)){
          try{
              await ChatModel.findByIdAndDelete(req.params.chatId);
              res.status(200).json("Delete group succesfully");
          }
          catch(err){
              res.status(500).json(`ERROR: ${err}`);
          }
      }else {
          res.status(403).json("You're not the admin of this group");
      }
  },


  // rời nhóm chat
  leaveGroup: async(req,res) => {
      if (await checkMemberFromGroup(req.user.id, req.params.chatId)) {
          try{
              const userId = req.user.id;
              const chat = await ChatModel.findById(req.params.chatId);
              chat.members = chat.members.filter(memberId => memberId !== userId);
              await chat.save();

              return res.status(200).json("Leave group successfully");
          }
          catch(err){
              res.status(500).json(`ERROR: ${err}`);
          }
      }else {
          res.status(403).json("You're not a member of this group");
      }
  },
      
  // Get chat from user    
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

    // search chat 2 people
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

      //GET A Chat
    getAChat: async(req,res) => {
        try{
            const chat = await ChatModel.findById(req.params.chatId); 
            res.status(200).json(chat);
        }catch(err){
            return  res.status(500).json(err);
        }
    },
};

// Check admin
async function checkPermissionModifyGroup (userId, chatId) {
  const chat = await ChatModel.findById(chatId);
  return chat?.createId == userId;
};

// Check if the person making the update is the creator
async function checkMemberFromGroup(userId, chatId) {
  try {
    const chat = await ChatModel.findById(chatId);
    return chat?.members.some(memberId => memberId === userId);
  } catch (err) {
    console.error(err);
    return false; // Trả về false nếu có lỗi xảy ra trong quá trình tìm kiếm group
  }
};

// Hàm tìm người dùng dựa trên tên người dùng (username)
  const findUserByUsername = async (username) => {
    return await User.findOne({ username });
  };
     
  // Hàm tìm chat room dựa trên ID chat
  const findChatRoomById = async (chatId) => {
    return await ChatModel.findById(chatId);
  };
module.exports = chatController;
