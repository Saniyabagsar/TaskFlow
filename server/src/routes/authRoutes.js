const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user
router.post('/register', registerValidator, register);

// POST /api/auth/login - Log in user
router.post('/login', loginValidator, login);

// GET /api/auth/me - Get current user profile (Protected)
router.get('/me', protect, getMe);

module.exports = router;
