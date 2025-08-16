/**
 * Mongoose model cho Album
 * Quản lý album âm nhạc và danh sách bài hát
 */

const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  // Thông tin cơ bản
  title: {
    type: String,
    required: [true, 'Tên album là bắt buộc'],
    trim: true,
    maxlength: [255, 'Tên album không được quá 255 ký tự']
  },
  
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Artist ID là bắt buộc']
  },
  
  genre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    default: null
  },
  
  // Hình ảnh
  cover_image: {
    type: String,
    default: null
  },
  
  // Thông tin phát hành
  release_year: {
    type: Number,
    min: [1900, 'Năm phát hành phải từ 1900'],
    max: [new Date().getFullYear() + 1, 'Năm phát hành không được vượt quá năm tiếp theo']
  },
  
  release_date: {
    type: Date,
    default: null
  },
  
  // Mô tả
  description: {
    type: String,
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự'],
    default: ''
  },
  
  // Thông tin kỹ thuật
  total_tracks: {
    type: Number,
    default: 0,
    min: [0, 'Số bài hát không được âm']
  },
  
  total_duration: {
    type: Number, // giây
    default: 0,
    min: [0, 'Tổng thời lượng không được âm']
  },
  
  // Thống kê
  total_plays: {
    type: Number,
    default: 0
  },
  
  total_likes: {
    type: Number,
    default: 0
  },
  
  total_shares: {
    type: Number,
    default: 0
  },
  
  total_downloads: {
    type: Number,
    default: 0
  },
  
  // Trạng thái
  is_public: {
    type: Boolean,
    default: true
  },
  
  is_featured: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Thông tin bản quyền
  copyright: {
    type: String,
    maxlength: [255, 'Thông tin bản quyền không được quá 255 ký tự']
  },
  
  label: {
    type: String,
    maxlength: [255, 'Tên hãng đĩa không được quá 255 ký tự']
  },
  
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  meta_title: {
    type: String,
    maxlength: [60, 'Meta title không được quá 60 ký tự']
  },
  
  meta_description: {
    type: String,
    maxlength: [160, 'Meta description không được quá 160 ký tự']
  },
  
  // Tags
  tags: [{
    type: String,
    maxlength: [50, 'Tag không được quá 50 ký tự']
  }],
  
  // Cài đặt
  settings: {
    allow_comments: {
      type: Boolean,
      default: true
    },
    allow_download: {
      type: Boolean,
      default: true
    },
    require_approval: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
albumSchema.index({ title: 1 });
albumSchema.index({ artist_id: 1 });
albumSchema.index({ genre_id: 1 });
albumSchema.index({ slug: 1 });
albumSchema.index({ is_public: 1 });
albumSchema.index({ status: 1 });
albumSchema.index({ release_year: -1 });
albumSchema.index({ total_plays: -1 });
albumSchema.index({ total_likes: -1 });

// Virtual fields
albumSchema.virtual('display_title').get(function() {
  return this.title;
});

albumSchema.virtual('is_released').get(function() {
  if (!this.release_date) return false;
  return this.release_date <= new Date();
});

albumSchema.virtual('duration_formatted').get(function() {
  const hours = Math.floor(this.total_duration / 3600);
  const minutes = Math.floor((this.total_duration % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware - Tạo slug tự động
albumSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Instance methods
albumSchema.methods.incrementPlayCount = function(count = 1) {
  this.total_plays += count;
  return this.save();
};

albumSchema.methods.incrementLikeCount = function(count = 1) {
  this.total_likes += count;
  return this.save();
};

albumSchema.methods.incrementShareCount = function(count = 1) {
  this.total_shares += count;
  return this.save();
};

albumSchema.methods.incrementDownloadCount = function(count = 1) {
  this.total_downloads += count;
  return this.save();
};

albumSchema.methods.updateTrackCount = function() {
  const Song = mongoose.model('Song');
  return Song.countDocuments({ 
    album_id: this._id, 
    is_public: true,
    status: 'approved'
  }).then(count => {
    this.total_tracks = count;
    return this.save();
  });
};

albumSchema.methods.updateDuration = function() {
  const Song = mongoose.model('Song');
  return Song.aggregate([
    { $match: { album_id: this._id, is_public: true, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$duration' } } }
  ]).then(result => {
    this.total_duration = result.length > 0 ? result[0].total : 0;
    return this.save();
  });
};

albumSchema.methods.updateCounts = function() {
  return Promise.all([
    this.updateTrackCount(),
    this.updateDuration()
  ]);
};

// Static methods
albumSchema.statics.findPublic = function() {
  return this.find({ 
    is_public: true, 
    status: 'approved' 
  }).sort({ release_year: -1, total_plays: -1 });
};

albumSchema.statics.findByArtist = function(artistId) {
  return this.find({ 
    artist_id: artistId, 
    is_public: true, 
    status: 'approved' 
  }).sort({ release_year: -1 });
};

albumSchema.statics.findByGenre = function(genreId) {
  return this.find({ 
    genre_id: genreId, 
    is_public: true, 
    status: 'approved' 
  }).sort({ total_plays: -1 });
};

albumSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ 
    is_public: true, 
    status: 'approved',
    is_featured: true 
  }).sort({ total_plays: -1 }).limit(limit);
};

albumSchema.statics.findRecent = function(limit = 10) {
  return this.find({ 
    is_public: true, 
    status: 'approved' 
  }).sort({ release_date: -1 }).limit(limit);
};

albumSchema.statics.searchByTitle = function(query) {
  return this.find({
    title: { $regex: query, $options: 'i' },
    is_public: true,
    status: 'approved'
  });
};

albumSchema.statics.findBySlug = function(slug) {
  return this.findOne({ 
    slug: slug.toLowerCase(), 
    is_public: true,
    status: 'approved'
  });
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
