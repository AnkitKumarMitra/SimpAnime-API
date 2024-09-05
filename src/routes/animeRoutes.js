import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getAnimeDetailsById,
    getAnimeDetailsByName,
    getSeasonAnime,
    getTopSeasonAnime,
    recentUpload,
    searchAnime,
    episode,
    getEpisodeSource
} from '../controllers/animeController.js';
import {
    registerUser,
    loginUser,
    addToWatchlist,
    removeFromWatchlist,
    addReview,
    updateReview,
    deleteReview
} from '../controllers/userController.js';
import { home } from '../controllers/homeController.js';

const router = express.Router();

// Public Routes
router.get('/', home);
router.get('/anime/search', searchAnime);
router.get('/anime/gogo/search', getAnimeDetailsByName);
router.get('/anime/season', getSeasonAnime);
router.get('/anime/season/top', getTopSeasonAnime);
router.get('/anime/recent-uploads', recentUpload);
router.get('/anime/episodes/:id', episode);
router.get('/anime/get-episode-source/:id', getEpisodeSource);
router.get('/anime/:id', getAnimeDetailsById);

// Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (requires authentication)
router.post('/watchlist/add', authMiddleware, addToWatchlist);
router.post('/watchlist/remove', authMiddleware, removeFromWatchlist);
router.post('/review/add', authMiddleware, addReview);
router.put('/review/update', authMiddleware, updateReview);
router.delete('/review/delete', authMiddleware, deleteReview);

export default router;