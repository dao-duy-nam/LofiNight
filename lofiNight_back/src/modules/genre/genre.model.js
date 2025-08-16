/**
 * Mongoose model cho Genre
 * Quản lý thể loại âm nhạc
 */

const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  // Thông tin cơ bản
  name: {
    type: String,
    required: [true, 'Tên thể loại là bắt buộc'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên thể loại không được quá 100 ký tự']
  },
  
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được quá 500 ký tự'],
    default: ''
  },
  
  // Màu sắc đại diện
  color: {
    type: String,
    default: '#6366f1',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Màu sắc phải là mã hex hợp lệ']
  },
  
  // Icon đại diện
  icon: {
    type: String,
    default: null
  },
  
  // Hình ảnh đại diện
  image: {
    type: String,
    default: null
  },
  
  // Thể loại cha (cho sub-genres)
  parent_genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    default: null
  },
  
  // Thống kê
  total_songs: {
    type: Number,
    default: 0
  },
  
  total_albums: {
    type: Number,
    default: 0
  },
  
  total_artists: {
    type: Number,
    default: 0
  },
  
  total_plays: {
    type: Number,
    default: 0
  },
  
  // Trạng thái
  is_active: {
    type: Boolean,
    default: true
  },
  
  is_featured: {
    type: Boolean,
    default: false
  },
  
  // Thứ tự hiển thị
  display_order: {
    type: Number,
    default: 0
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
  
  // Cài đặt
  settings: {
    allow_upload: {
      type: Boolean,
      default: true
    },
    require_approval: {
      type: Boolean,
      default: false
    },
    max_song_duration: {
      type: Number, // giây
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
genreSchema.index({ name: 1 });
genreSchema.index({ slug: 1 });
genreSchema.index({ parent_genre: 1 });
genreSchema.index({ is_active: 1 });
genreSchema.index({ is_featured: 1 });
genreSchema.index({ display_order: 1 });
genreSchema.index({ total_plays: -1 });

// Virtual fields
genreSchema.virtual('is_parent').get(function() {
  return !this.parent_genre;
});

genreSchema.virtual('display_name').get(function() {
  return this.name;
});

// Pre-save middleware - Tạo slug tự động
genreSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Instance methods
genreSchema.methods.incrementSongCount = function(count = 1) {
  this.total_songs += count;
  return this.save();
};

genreSchema.methods.incrementAlbumCount = function(count = 1) {
  this.total_albums += count;
  return this.save();
};

genreSchema.methods.incrementArtistCount = function(count = 1) {
  this.total_artists += count;
  return this.save();
};

genreSchema.methods.incrementPlayCount = function(count = 1) {
  this.total_plays += count;
  return this.save();
};

genreSchema.methods.updateCounts = function() {
  const Song = mongoose.model('Song');
  const Album = mongoose.model('Album');
  const Artist = mongoose.model('Artist');
  
  return Promise.all([
    Song.countDocuments({ 
      genre_id: this._id, 
      is_public: true,
      status: 'approved'
    }),
    Album.countDocuments({ 
      genre_id: this._id, 
      is_public: true 
    }),
    Artist.countDocuments({ 
      primary_genres: this._id, 
      is_active: true 
    })
  ]).then(([songCount, albumCount, artistCount]) => {
    this.total_songs = songCount;
    this.total_albums = albumCount;
    this.total_artists = artistCount;
    return this.save();
  });
};

// Static methods
genreSchema.statics.findActive = function() {
  return this.find({ is_active: true }).sort({ display_order: 1, name: 1 });
};

genreSchema.statics.findFeatured = function() {
  return this.find({ is_active: true, is_featured: true }).sort({ display_order: 1 });
};

genreSchema.statics.findParents = function() {
  return this.find({ parent_genre: null, is_active: true }).sort({ display_order: 1 });
};

genreSchema.statics.findSubGenres = function(parentId) {
  return this.find({ parent_genre: parentId, is_active: true }).sort({ display_order: 1 });
};

genreSchema.statics.findPopular = function(limit = 10) {
  return this.find({ is_active: true })
    .sort({ total_plays: -1, total_songs: -1 })
    .limit(limit);
};

genreSchema.statics.searchByName = function(query) {
  return this.find({
    name: { $regex: query, $options: 'i' },
    is_active: true
  });
};

genreSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), is_active: true });
};

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
