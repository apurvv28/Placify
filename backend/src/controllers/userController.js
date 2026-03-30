const UserRepository = require('../repositories/UserRepository');
const MessageRepository = require('../repositories/MessageRepository');

const userRepo = new UserRepository();
const messageRepo = new MessageRepository();

const getAllUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.userId;

    const currentUser = await userRepo.findById(loggedInUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }
    const blockedUserIds = currentUser.blockedUsers || [];

    const allUsers = await userRepo.findAll();
    const users = allUsers.filter((u) => u.userId !== loggedInUserId);

    const usersWithLastMessage = await Promise.all(users.map(async (user) => {
      let lastMessage = null;
      let unreadCount = 0;

      try {
        const { items: convo } = await messageRepo.findByConversation(loggedInUserId, user.userId, 200);
        const visible = convo.filter((m) => !(m.deletedBy || []).includes(loggedInUserId));
        lastMessage = visible.length > 0 ? [...visible].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
        unreadCount = visible.filter((m) => m.senderId === user.userId && m.receiverId === loggedInUserId && !m.seen).length;
      } catch (e) {
        lastMessage = null;
        unreadCount = 0;
      }

      let role = 'Unplaced';
      if (user.profileType === 'working_professional') {
        role = 'Professional';
      } else if (user.studentStatus === 'placed') {
        role = 'Placed';
      }

      return {
        _id: user.userId,
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
        isBlocked: blockedUserIds.includes(user.userId)
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

    const currentUser = await userRepo.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const blockedUsers = currentUser.blockedUsers || [];
    if (!blockedUsers.includes(userIdToBlock)) {
      blockedUsers.push(userIdToBlock);
    }
    await userRepo.update(currentUserId, { blockedUsers });

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const unblockUser = async (req, res) => {
  try {
    const userIdToUnblock = req.params.userId;
    const currentUserId = req.userId;

    const currentUser = await userRepo.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const blockedUsers = (currentUser.blockedUsers || []).filter((id) => id !== userIdToUnblock);
    await userRepo.update(currentUserId, { blockedUsers });

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const user = await userRepo.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let role = 'Unplaced';
    if (user.profileType === 'working_professional') {
      role = 'Professional';
    } else if (user.studentStatus === 'placed') {
      role = 'Placed';
    }

    const { password, ...safeUser } = user;
    res.status(200).json({ ...safeUser, role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, blockUser, unblockUser, getUserProfile };
