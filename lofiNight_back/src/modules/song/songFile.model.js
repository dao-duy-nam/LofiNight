/**
 * Mongoose model cho SongFile
 * Quản lý các phiên bản chất lượng khác nhau của bài hát
 */

const mongoose = require('mongoose');

const songFileSchema = new mongoose.Schema({
  // Liên kết với bài hát
  song_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: [true, 'Song ID là bắt buộc']
  },
  
  // Chất lượng âm thanh
  quality: {
    type: String,
    enum: ['128kbps', '320kbps', 'lossless'],
    required: [true, 'Chất lượng âm thanh là bắt buộc']
  },
  
  // Đường dẫn file
  file_path: {
    type: String,
    required: [true, 'Đường dẫn file là bắt buộc'],
    maxlength: [500, 'Đường dẫn file không được quá 500 ký tự']
  },
  
  // Kích thước file (bytes)
  file_size: {
    type: Number,
    required: [true, 'Kích thước file là bắt buộc'],
    min: [1, 'Kích thước file phải lớn hơn 0']
  },
  
  // Thời lượng (giây) - có thể khác với song gốc
  duration: {
    type: Number,
    required: [true, 'Thời lượng là bắt buộc'],
    min: [1, 'Thời lượng phải lớn hơn 0']
  },
  
  // Thông tin kỹ thuật
  bitrate: {
    type: Number, // kbps
    required: [true, 'Bitrate là bắt buộc']
  },
  
  sample_rate: {
    type: Number, // Hz
    required: [true, 'Sample rate là bắt buộc']
  },
  
  channels: {
    type: Number,
    enum: [1, 2], // Mono, Stereo
    default: 2
  },
  
  // Trạng thái file
  is_available: {
    type: Boolean,
    default: true
  },
  
  // Thông tin upload
  uploaded_at: {
    type: Date,
    default: Date.now
  },
  
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User upload là bắt buộc']
  },
  
  // Checksum để kiểm tra tính toàn vẹn
  checksum: {
    type: String,
    maxlength: [64, 'Checksum không được quá 64 ký tự']
  },
  
  // Thông tin CDN
  cdn_url: {
    type: String,
    maxlength: [500, 'CDN URL không được quá 500 ký tự']
  },
  
  // Thống kê
  total_downloads: {
    type: Number,
    default: 0
  },
  
  total_streams: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
songFileSchema.index({ song_id: 1 });
songFileSchema.index({ quality: 1 });
songFileSchema.index({ is_available: 1 });
songFileSchema.index({ uploaded_at: -1 });

// Compound index để đảm bảo mỗi bài hát chỉ có một phiên bản cho mỗi chất lượng
songFileSchema.index({ song_id: 1, quality: 1 }, { unique: true });

// Virtual fields
songFileSchema.virtual('file_size_mb').get(function() {
  return (this.file_size / (1024 * 1024)).toFixed(2);
});

songFileSchema.virtual('file_size_kb').get(function() {
  return (this.file_size / 1024).toFixed(2);
});

songFileSchema.virtual('duration_formatted').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

songFileSchema.virtual('is_high_quality').get(function() {
  return this.quality === '320kbps' || this.quality === 'lossless';
});

// Instance methods
songFileSchema.methods.incrementDownloadCount = function(count = 1) {
  this.total_downloads += count;
  return this.save();
};

songFileSchema.methods.incrementStreamCount = function(count = 1) {
  this.total_streams += count;
  return this.save();
};

songFileSchema.methods.getDownloadUrl = function() {
  return this.cdn_url || this.file_path;
};

// Static methods
songFileSchema.statics.findBySong = function(songId) {
  return this.find({ song_id: songId, is_available: true }).sort({ quality: 1 });
};

songFileSchema.statics.findByQuality = function(songId, quality) {
  return this.findOne({ song_id: songId, quality: quality, is_available: true });
};

songFileSchema.statics.findAvailableQualities = function(songId) {
  return this.find({ song_id: songId, is_available: true })
    .select('quality duration file_size bitrate')
    .sort({ quality: 1 });
};

songFileSchema.statics.findHighQuality = function(songId) {
  return this.find({ 
    song_id: songId, 
    quality: { $in: ['320kbps', 'lossless'] },
    is_available: true 
  }).sort({ quality: 1 });
};

songFileSchema.statics.findByUser = function(userId) {
  return this.find({ uploaded_by: userId }).sort({ uploaded_at: -1 });
};

// Pre-save middleware
songFileSchema.pre('save', function(next) {
  // Tự động tính bitrate nếu không có
  if (!this.bitrate && this.quality) {
    switch (this.quality) {
      case '128kbps':
        this.bitrate = 128;
        break;
      case '320kbps':
        this.bitrate = 320;
        break;
      case 'lossless':
        this.bitrate = 1411; // CD quality
        break;
    }
  }
  
  // Tự động tính sample rate nếu không có
  if (!this.sample_rate) {
    this.sample_rate = 44100; // CD quality
  }
  
  next();
});

// Pre-remove middleware
songFileSchema.pre('remove', function(next) {
  // Có thể thêm logic xóa file vật lý ở đây
  next();
});

const SongFile = mongoose.model('SongFile', songFileSchema);

module.exports = SongFile;
