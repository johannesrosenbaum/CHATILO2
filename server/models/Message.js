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
  // 🌲 REDDIT-STYLE COMMENT TREE STRUCTURE
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 10 // Maximal 10 Verschachtelungsebenen
  },
  childrenCount: {
    type: Number,
    default: 0
  },
  isPost: {
    type: Boolean,
    default: function() {
      return !this.parentMessage; // Ist Post wenn kein Parent vorhanden
    }
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: function() {
      return this.parentMessage ? undefined : this._id; // Root Post ist sein eigener Thread
    }
  },
  // Reddit-Style Voting
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    default: 0
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

// 🚀 OPTIMIZED INDEXES für Reddit-Style Threading
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ chatRoom: 1, isPost: 1, createdAt: -1 }); // Posts zuerst laden
messageSchema.index({ parentMessage: 1, createdAt: 1 }); // Kommentare eines Posts
messageSchema.index({ threadId: 1, level: 1, createdAt: 1 }); // Thread-Hierarchie
messageSchema.index({ sender: 1 });
messageSchema.index({ score: -1 }); // Für Sortierung nach Score

module.exports = mongoose.model('Message', messageSchema);
