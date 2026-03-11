const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    seen: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
    deletedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);

