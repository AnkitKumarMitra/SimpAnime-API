import express from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/authController.js';
import authLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', authLimiter, logoutUser);
router.post('/refresh-token', authLimiter, refreshAccessToken)

export default router;