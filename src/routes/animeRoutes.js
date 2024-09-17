import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getAnimeDetailsById,
    getAnimeDetailsByName,
    getSeasonAnime,
    recentUpload,
    searchAnime,
    episode,
    getEpisodeSource,
    getTrendingAnime,
    spotlightAnime,
    getBannerAndPoster
} from '../controllers/animeController.js';
import {
    addToWatchlist,
    removeFromWatchlist,
    addReview,
    updateReview,
    deleteReview
} from '../controllers/userController.js';

const router = express.Router();

// Public Routes
router.get('/anime/search', searchAnime);
router.get('/anime/season', getSeasonAnime);
router.get('/anime/trending', getTrendingAnime);
router.get('/anime/gogo-search', getAnimeDetailsByName);
router.get('/anime/spotlight', spotlightAnime);
router.get('/anime/recent-uploads', recentUpload);
router.get('/anime/episodes/:id', episode);
router.get('/anime/get-episode-source/:id', getEpisodeSource);
router.get('/anime/get-banner-poster/:name', getBannerAndPoster);
router.get('/anime/:id', getAnimeDetailsById);

// Protected Routes
router.post('/watchlist/add', authMiddleware, addToWatchlist);
router.post('/watchlist/remove', authMiddleware, removeFromWatchlist);
router.post('/review/add', authMiddleware, addReview);
router.put('/review/update', authMiddleware, updateReview);
router.delete('/review/delete', authMiddleware, deleteReview);

export default router;
