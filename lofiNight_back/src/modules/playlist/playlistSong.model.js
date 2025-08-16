/**
 * Mongoose model cho PlaylistSong
 * Quản lý mối quan hệ giữa playlist và bài hát
 */

const mongoose = require('mongoose');

const playlistSongSchema = new mongoose.Schema({
  // Liên kết với playlist
  playlist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: [true, 'Playlist ID là bắt buộc']
  },
  
  // Liên kết với bài hát
  song_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: [true, 'Song ID là bắt buộc']
  },
  
  // Vị trí trong playlist
  position: {
    type: Number,
    required: [true, 'Vị trí là bắt buộc'],
    min: [1, 'Vị trí phải lớn hơn 0']
  },
  
  // Thời gian thêm vào playlist
  added_at: {
    type: Date,
    default: Date.now
  },
  
  // Người thêm (nếu là collaborative playlist)
  added_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Ghi chú cá nhân cho bài hát
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không được quá 500 ký tự'],
    default: ''
  },
  
  // Trạng thái
  is_active: {
    type: Boolean,
    default: true
  },
  
  // Thống kê
  play_count: {
    type: Number,
    default: 0
  },
  
  last_played: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
playlistSongSchema.index({ playlist_id: 1 });
playlistSongSchema.index({ song_id: 1 });
playlistSongSchema.index({ playlist_id: 1, position: 1 });
playlistSongSchema.index({ added_at: -1 });

// Compound index để đảm bảo mỗi bài hát chỉ xuất hiện một lần trong playlist
playlistSongSchema.index({ playlist_id: 1, song_id: 1 }, { unique: true });

// Virtual fields
playlistSongSchema.virtual('is_recently_added').get(function() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return this.added_at > oneWeekAgo;
});

// Instance methods
playlistSongSchema.methods.incrementPlayCount = function(count = 1) {
  this.play_count += count;
  this.last_played = new Date();
  return this.save();
};

playlistSongSchema.methods.updatePosition = function(newPosition) {
  this.position = newPosition;
  return this.save();
};

// Static methods
playlistSongSchema.statics.findByPlaylist = function(playlistId) {
  return this.find({ playlist_id: playlistId, is_active: true })
    .populate('song_id')
    .sort({ position: 1 });
};

playlistSongSchema.statics.findBySong = function(songId) {
  return this.find({ song_id: songId, is_active: true })
    .populate('playlist_id')
    .sort({ added_at: -1 });
};

playlistSongSchema.statics.findByPlaylistAndSong = function(playlistId, songId) {
  return this.findOne({ playlist_id: playlistId, song_id: songId });
};

playlistSongSchema.statics.getNextPosition = function(playlistId) {
  return this.findOne({ playlist_id: playlistId })
    .sort({ position: -1 })
    .then(lastSong => {
      return lastSong ? lastSong.position + 1 : 1;
    });
};

playlistSongSchema.statics.reorderPositions = function(playlistId) {
  return this.find({ playlist_id: playlistId, is_active: true })
    .sort({ position: 1 })
    .then(songs => {
      const updates = songs.map((song, index) => {
        return this.updateOne(
          { _id: song._id },
          { position: index + 1 }
        );
      });
      return Promise.all(updates);
    });
};

playlistSongSchema.statics.removeSong = function(playlistId, songId) {
  return this.deleteOne({ playlist_id: playlistId, song_id: songId })
    .then(() => {
      // Cập nhật lại vị trí các bài hát còn lại
      return this.reorderPositions(playlistId);
    });
};

playlistSongSchema.statics.addSong = function(playlistId, songId, userId = null) {
  return this.getNextPosition(playlistId)
    .then(position => {
      const playlistSong = new this({
        playlist_id: playlistId,
        song_id: songId,
        position: position,
        added_by: userId
      });
      return playlistSong.save();
    });
};

playlistSongSchema.statics.moveSong = function(playlistId, songId, newPosition) {
  return this.findOne({ playlist_id: playlistId, song_id: songId })
    .then(playlistSong => {
      if (!playlistSong) {
        throw new Error('Bài hát không tồn tại trong playlist');
      }
      
      const oldPosition = playlistSong.position;
      
      if (oldPosition === newPosition) {
        return playlistSong;
      }
      
      // Cập nhật vị trí các bài hát khác
      if (oldPosition < newPosition) {
        // Di chuyển xuống dưới
        return this.updateMany(
          { 
            playlist_id: playlistId, 
            position: { $gt: oldPosition, $lte: newPosition } 
          },
          { $inc: { position: -1 } }
        ).then(() => {
          playlistSong.position = newPosition;
          return playlistSong.save();
        });
      } else {
        // Di chuyển lên trên
        return this.updateMany(
          { 
            playlist_id: playlistId, 
            position: { $gte: newPosition, $lt: oldPosition } 
          },
          { $inc: { position: 1 } }
        ).then(() => {
          playlistSong.position = newPosition;
          return playlistSong.save();
        });
      }
    });
};

// Pre-save middleware
playlistSongSchema.pre('save', function(next) {
  // Tự động cập nhật vị trí nếu không có
  if (!this.position) {
    this.constructor.getNextPosition(this.playlist_id)
      .then(position => {
        this.position = position;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Pre-remove middleware
playlistSongSchema.pre('remove', function(next) {
  // Cập nhật lại vị trí các bài hát còn lại
  this.constructor.reorderPositions(this.playlist_id)
    .then(() => next())
    .catch(next);
});

const PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

module.exports = PlaylistSong;
