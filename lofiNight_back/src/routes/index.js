/**
 * Gộp toàn bộ routes từ các module
 * Import và mount tất cả module routes
 */

const express = require('express');
const router = express.Router();

// Import các module routes
const userRoutes = require('../modules/user/user.routes');
const songRoutes = require('../modules/song/song.routes');
const playlistRoutes = require('../modules/playlist/playlist.routes');

// Mount các routes
router.use('/users', userRoutes);
// router.use('/songs', songRoutes);
// router.use('/playlists', playlistRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Lofi Night API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      songs: '/api/songs',
      playlists: '/api/playlists',
      docs: '/api-docs'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
