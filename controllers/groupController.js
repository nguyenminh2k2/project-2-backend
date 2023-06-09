const Group = require("../models/Group");
const User = require("../models/User");

const groupController =  {
    createGroup: async (req, res) => {
        try {
            const users = await User.findById(req.user.id);
            const makeGroup = {
                ...req.body,
                createId: users.id,
                members: [users.id, ...req.body.members], 
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
      

    removerMember: async (req, res) => {
        if (await checkPermissionModifyGroup(req.user.id, req.params.groupId)) {
            const membersToRemove = req.body.membersToRemove;// Mảng chứa ID của thành viên cần xóa
            try{
                const group = await Group.findById(req.params.groupId);
                group.members = group.members.filter(member => !membersToRemove.includes(member));
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
                group.members = [...new Set([...group.members, ...membersToAdd])];
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
                // const group = await Group.findById(req.params.groupId);
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
