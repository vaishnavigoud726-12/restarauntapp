const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerRestaurant,
  login,
  startGitHubOAuth,
  completeGitHubOAuth,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/register-restaurant', registerRestaurant);
router.post('/login', login);
router.get('/github', startGitHubOAuth);
router.get('/github/callback', completeGitHubOAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
