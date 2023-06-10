const Group = require("../models/Group");
const PostGroup = require("../models/PostGroup");
const User = require("../models/User");

const postGroupController = {
    // Create Post
    createPostInGroup : async (req, res) => {
    try {
        const users = await User.findById(req.user.id);

        // Kiểm tra xem người dùng có quyền đăng bài trong nhóm hay không
        const hasPermission = await checkMemberFromGroup(req.user.id, req.params.groupId);
        if (!hasPermission) {
            return res.status(403).json("You're not a member of this group");
        }

        // Tạo bài viết mới
        const newPost = new PostGroup({
            ...req.body,
            userId: users.id,
            username: users.username,
            groupId: req.params.groupId,
            avaUrl: users.profilePicture,
            theme: users.theme,
        });

        // Lưu bài viết vào cơ sở dữ liệu
        const savedPost = await newPost.save();

        return res.status(200).json(savedPost);
    } catch (err) {
        return res.status(500).json(`ERROR: ${err}`);
    }
    },

    //UPDATE A POST
    updatePost: async (req, res) => {
        const hasPermission = await checkMemberFromGroup(req.user.id, req.params.groupId);
        if (!hasPermission) {
            return res.status(403).json("You're not a member of this group");
        } else {
            if (await checkPermissionModifyPost(req.user.id, req.params.postId)) {
            try {
                const post = await PostGroup.findById(req.params.postId.trim());
            
                await post.updateOne({ $set: req.body });
                res.status(200).json("Post has been updated");
                
            } catch (err) {
                res.status(500).json(err);
            }
            } else {
            res.status(403).json("You're not allowed to do that!");
            }
        }  
   },

  //DELETE A POST
    deleteAPost: async (req, res) => {
        const group = await Group.findById(req.params.groupId);
        const hasPermission = await checkMemberFromGroup(req.user.id, req.params.groupId);
        if (!hasPermission) {
            return res.status(403).json("You're not a member of this group");
        } else {
            if (await checkPermissionModifyPost(req.user.id, req.params.postId) || group.createId ) {
            try {
                await PostGroup.findByIdAndDelete(req.params.postId.trim());
                res.status(200).json("Delete post succesfully");       
            } catch (err) {
                res.status(500).json(err);
            }
            } else {
                res.status(403).json("You're not allowed to do that!");
            }
        }  
    },

    // Get All Post
    getAllPosts: async (req, res) => {
        const hasPermission = await checkMemberFromGroup(req.user.id, req.params.groupId);
        if (!hasPermission) {
            return res.status(403).json("You're not a member of this group");
        }else {
            try {
                res.status(200).json(res.paginatedResults);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    },
};

 // Check if the person making the update is the creator
 async function checkMemberFromGroup(userId, groupId) {
    try {
      const group = await Group.findById(groupId);
      return group?.members.some(memberId => memberId === userId);
    } catch (err) {
      console.error(err);
      return false; 
    }
};

// Check User Post
async function checkPermissionModifyPost (userId, postId) {
    const post = await PostGroup.findById(postId);
    return post?.userId == userId;
}

// Check admin
async function checkPermissionModifyGroup (userId, groupId) {
    const group = await Group.findById(groupId);
    return group?.createId == userId;
};

module.exports = postGroupController;
