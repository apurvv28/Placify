const User = require('../models/User');
const Message = require('../models/Message');

const getAllUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.userId;

    // Fetch the current user to see who they've blocked
    const currentUser = await User.findById(loggedInUserId);
    const blockedUserIds = currentUser.blockedUsers || [];

    // Find all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select('name avatar email profileType studentStatus workingRole isOnline lastSeen linkedinUrl');

    const usersWithLastMessage = await Promise.all(users.map(async (user) => {
      // Find the last message between loggedInUserId and user._id, excluding messages cleared by the current user
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ],
        deletedBy: { $ne: loggedInUserId }
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUserId,
        seen: false,
        deletedBy: { $ne: loggedInUserId }
      });

      let role = 'Unplaced';
      if (user.profileType === 'working_professional') {
        role = 'Professional';
      } else if (user.studentStatus === 'placed') {
        role = 'Placed';
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: role,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        linkedinUrl: user.linkedinUrl,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        } : null,
        unreadCount,
        isBlocked: blockedUserIds.includes(user._id)
      };
    }));

    // Sort by last message date
    usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const blockUser = async (req, res) => {
  try {
    const userIdToBlock = req.params.userId;
    const currentUserId = req.userId;

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: userIdToBlock }
    });

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const userIdToUnblock = req.params.userId;
    const currentUserId = req.userId;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: userIdToUnblock }
    });

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let role = 'Unplaced';
    if (user.profileType === 'working_professional') {
      role = 'Professional';
    } else if (user.studentStatus === 'placed') {
      role = 'Placed';
    }

    res.status(200).json({ ...user.toObject(), role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, blockUser, unblockUser, getUserProfile };
