/**
 * Mongoose model cho Artist
 * Quản lý thông tin nghệ sĩ và nội dung âm nhạc
 */

const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  // Thông tin cơ bản
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
    unique: true
  },
  
  artist_name: {
    type: String,
    required: [true, 'Tên nghệ sĩ là bắt buộc'],
    trim: true,
    maxlength: [255, 'Tên nghệ sĩ không được quá 255 ký tự']
  },
  
  bio: {
    type: String,
    maxlength: [1000, 'Tiểu sử không được quá 1000 ký tự'],
    default: ''
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  cover_image: {
    type: String,
    default: null
  },
  
  // Trạng thái xác minh
  is_verified: {
    type: Boolean,
    default: false
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
  
  total_followers: {
    type: Number,
    default: 0
  },
  
  total_songs: {
    type: Number,
    default: 0
  },
  
  total_albums: {
    type: Number,
    default: 0
  },
  
  // Thông tin liên hệ
  social_links: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    website: String
  },
  
  // Thể loại chính
  primary_genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  
  // Quốc gia
  country: {
    type: String,
    maxlength: [100, 'Quốc gia không được quá 100 ký tự']
  },
  
  // Ngày thành lập
  founded_year: {
    type: Number,
    min: [1900, 'Năm thành lập phải từ 1900'],
    max: [new Date().getFullYear(), 'Năm thành lập không được vượt quá năm hiện tại']
  },
  
  // Trạng thái hoạt động
  is_active: {
    type: Boolean,
    default: true
  },
  
  // Thông tin xác minh
  verification_documents: [{
    document_type: {
      type: String,
      enum: ['id_card', 'passport', 'business_license', 'other']
    },
    document_url: String,
    verified_at: Date,
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Cài đặt
  settings: {
    allow_comments: {
      type: Boolean,
      default: true
    },
    allow_messages: {
      type: Boolean,
      default: false
    },
    auto_approve_comments: {
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
artistSchema.index({ artist_name: 1 });
artistSchema.index({ user_id: 1 });
artistSchema.index({ is_verified: 1 });
artistSchema.index({ is_active: 1 });
artistSchema.index({ total_plays: -1 });
artistSchema.index({ total_followers: -1 });

// Virtual fields
artistSchema.virtual('display_name').get(function() {
  return this.artist_name;
});

artistSchema.virtual('is_popular').get(function() {
  return this.total_followers > 10000 || this.total_plays > 1000000;
});

// Instance methods
artistSchema.methods.incrementPlays = function(count = 1) {
  this.total_plays += count;
  return this.save();
};

artistSchema.methods.incrementLikes = function(count = 1) {
  this.total_likes += count;
  return this.save();
};

artistSchema.methods.incrementFollowers = function(count = 1) {
  this.total_followers += count;
  return this.save();
};

artistSchema.methods.updateSongCount = function() {
  return mongoose.model('Song').countDocuments({ 
    artist_id: this._id, 
    is_public: true,
    status: 'approved'
  }).then(count => {
    this.total_songs = count;
    return this.save();
  });
};

artistSchema.methods.updateAlbumCount = function() {
  return mongoose.model('Album').countDocuments({ 
    artist_id: this._id, 
    is_public: true 
  }).then(count => {
    this.total_albums = count;
    return this.save();
  });
};

// Static methods
artistSchema.statics.findVerified = function() {
  return this.find({ is_verified: true, is_active: true });
};

artistSchema.statics.findPopular = function(limit = 10) {
  return this.find({ is_active: true })
    .sort({ total_followers: -1, total_plays: -1 })
    .limit(limit);
};

artistSchema.statics.findByGenre = function(genreId) {
  return this.find({ 
    primary_genres: genreId, 
    is_active: true 
  });
};

artistSchema.statics.searchByName = function(query) {
  return this.find({
    artist_name: { $regex: query, $options: 'i' },
    is_active: true
  });
};

// Pre-save middleware
artistSchema.pre('save', function(next) {
  // Tự động cập nhật số lượng bài hát và album
  if (this.isModified('is_active') || this.isNew) {
    this.updateSongCount();
    this.updateAlbumCount();
  }
  next();
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
