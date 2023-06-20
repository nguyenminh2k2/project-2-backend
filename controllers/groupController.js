const Group = require("../models/Group");
const User = require("../models/User");

const groupController =  {
    createGroup: async (req, res) => {
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
            members.push(currentUser, ...memberIds);
            const makeGroup = {
                ...req.body,
                createId: users.id,
                members 
            };
            const newGroup = new Group(makeGroup);
            const result = await newGroup.save();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getAllGroup: async (req, res) => {
        const group = await Group.find();
        try{
            res.status(200).json(group);
        }
        catch (error) {
          res.status(500).json(error);
            
        }
    },

    getAGroup: async (req, res) => {
        try{
            const group = await Group.findById(req.params.groupId);
            res.status(200).json(group);
        }
        catch (error) {
          res.status(500).json(error);
            
        }
    },

    userGroups: async (req, res) => {
      try{
        const group = await Group.find({
          members: {$in: [req.params.userId]}
        });
        res.status(200).json(group);
      }
      catch(error){
        res.status(500).json(`ERROR: ${error}`)
      }
    },

    updateGroup: async (req, res) => {
        try {
          if (await checkPermissionModifyGroup(req.user.id, req.params.groupId)) {
            const updatedGroup = await Group.findByIdAndUpdate(
              req.params.groupId.trim(),
              { $set: req.body },
              { new: true }
            );
            res.status(200).json(updatedGroup);
          } else {
            res.status(403).json("You're not the admin of this group");
          }
        } catch (err) {
          res.status(500).json(`ERROR: ${err}`);
        }
    },

    getMembers: async (req, res) => {
        try {
          const groupId = req.params.groupId; // Lấy groupId từ tham số của API (hoặc thông qua req.body, req.query tùy vào cách bạn thiết kế API)
          const group = await Group.findById(groupId).select('members'); // Tìm chat dựa trên groupId và chỉ lấy trường 'members' (chứa các ID của thành viên)
          
          if (!group) {
            return res.status(404).json({ error: 'Chat not found' });
          }
      
          const memberIds = group.members; // Lấy danh sách ID của thành viên từ chat
          const members = await User.find({ _id: { $in: memberIds } }).select('id username'); // Truy vấn thông tin người dùng dựa trên các ID
      
          res.status(200).json({ members });
        } catch (error) {
          res.status(500).json(`ERROR: ${error}`);
        }
    },
      

    removerMember: async (req, res) => {
        if (await checkPermissionModifyGroup(req.user.id, req.params.groupId)) {
            const membersToRemove = req.body.membersToRemove;// Mảng chứa ID của thành viên cần xóa
            try{
                const group = await Group.findById(req.params.groupId);
                const updatedMembers = [];
                for (const memberId of group.members) {
                  const member = await User.findById(memberId);
                  if (!membersToRemove.includes(member.username)) {
                    updatedMembers.push(memberId);
                  }
                }
          
                group.members = updatedMembers;
                await group.save();

                res.status(200).json("Remove member successfully!");
            }catch(err){
                res.status(500).json(`ERROR: ${err}`);
            }
        }else {
            res.status(403).json("You're not the admin of this group");
        }
    },

    addMember: async (req, res) => {
        if (await checkMemberFromGroup(req.user.id, req.params.groupId)) {
            const membersToAdd = req.body.membersToAdd;// Mảng chứa ID của thành viên cần xóa
            try{
                const group = await Group.findById(req.params.groupId);
                const existingMembers = new Set(group.members); // Sử dụng Set để lưu trữ các thành viên hiện có
    
                for (const username of membersToAdd) {
                  const user = await User.findOne({ username });
                  if (user && !existingMembers.has(user.id)) {
                    group.members.push(user.id); // Thêm ID người dùng vào danh sách thành viên nếu chưa tồn tại
                    existingMembers.add(user.id); // Cập nhật Set với ID người dùng đã được thêm
                  }
                }
                await group.save();

                res.status(200).json("Add member successfully!");
            }catch(err){
                res.status(500).json(`ERROR: ${err}`);
            }
        }else {
            res.status(403).json("You're not a member of this group");
        }
    },

    daleteGroup: async (req, res) => {
        if (await checkPermissionModifyGroup(req.user.id, req.params.groupId)){
            try{
                await Group.findByIdAndDelete(req.params.groupId);
                res.status(200).json("Delete group succesfully");
            }
            catch(err){
                res.status(500).json(`ERROR: ${err}`);
            }
        }else {
            res.status(403).json("You're not the admin of this group");
        }
    },

    leaveGroup: async(req,res) => {
        if (await checkMemberFromGroup(req.user.id, req.params.groupId)) {
            try{
                const userId = req.user.id;
                const group = await Group.findById(req.params.groupId);
                group.members = group.members.filter(memberId => memberId !== userId);
                await group.save();

                return res.status(200).json("Leave group successfully");
            }
            catch(err){
                res.status(500).json(`ERROR: ${err}`);
            }
        }else {
            res.status(403).json("You're not a member of this group");
        }
    },

    joinGroup: async (req, res) => {
        try {
          const userId = req.user.id;
          const groupId = req.params.groupId;
      
          const group = await Group.findById(groupId);
      
          if (!group) {
            return res.status(404).json("Group not found");
          }
      
          if (group.type == true) {
            // Nếu nhóm không phải là private, cho phép người dùng tham gia trực tiếp
            group.members.push(userId);
            await group.save();
            return res.status(200).json("Join group successfully");
          } else {
            // Nếu nhóm là private, thêm yêu cầu vào danh sách pendingMembers
            if (!group.pendingMembers.includes(userId)) {
                group.pendingMembers.push(userId);
                await group.save();

                return res.status(200).json("Request to join group sent");
            } else {
                return res.status(409).json("You have already sent a request to join this group");
            }
          }
        } catch (err) {
          return res.status(500).json(`ERROR: ${err}`);
        }
    },

    // Admin accept members join
    approveRequest: async (req, res) => {
        const userId = req.user.id;
        const groupId = req.params.groupId;
        if(await checkPermissionModifyGroup(userId, groupId)) {
            try{
                const group = await Group.findById(groupId);
                
                const requestId = req.body.requestId; // ID của yêu cầu cần phê duyệt
                const index = group.pendingMembers.indexOf(requestId);

                if (index === -1) {
                    return res.status(404).json("Request not found");
                }

                // Xóa yêu cầu từ danh sách pendingMembers
                group.pendingMembers.splice(index, 1);

                // Thêm thành viên vào danh sách members
                group.members.push(requestId);

                await group.save();

                return res.status(200).json("Request approved successfully");
            }
            catch (err) {
                return res.status(500).json(`ERROR: ${err}`);
            }
        }else {
            res.status(403).json("You're not the admin of this group");
        }
    }
      
    
};

// Check admin
async function checkPermissionModifyGroup (userId, groupId) {
    const group = await Group.findById(groupId);
    return group?.createId == userId;
};

 // Check if the person making the update is the creator
async function checkMemberFromGroup(userId, groupId) {
    try {
      const group = await Group.findById(groupId);
      return group?.members.some(memberId => memberId === userId);
    } catch (err) {
      console.error(err);
      return false; // Trả về false nếu có lỗi xảy ra trong quá trình tìm kiếm group
    }
};
  

module.exports = groupController;
