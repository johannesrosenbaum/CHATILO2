const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: function() {
      // Content ist nur required wenn kein Media vorhanden ist
      return !this.mediaUrl && !this.media;
    },
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatRoom: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'gif', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  // Erweiterte Media-Informationen
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'gif', 'file'],
    },
    url: String,
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    // Für Videos/GIFs
    duration: Number,
    width: Number,
    height: Number,
    // Für Bilder
    thumbnail: String
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Zusätzliche Flags
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
