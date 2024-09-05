import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    watchlist: { type: [String], default: [] },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

export const addToWatchlist = async (req, res) => {
    try {
        const { userId, animeId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.watchlist.includes(animeId)) {
            user.watchlist.push(animeId);
            await user.save();
            res.status(200).json({ message: 'Anime added to watchlist' });
        } else {
            res.status(400).json({ message: 'Anime already in watchlist' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const removeFromWatchlist = async (req, res) => {
    try {
        const { userId, animeId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.watchlist.includes(animeId)) {
            user.watchlist = user.watchlist.filter(id => id !== animeId);
            await user.save();
            res.status(200).json({ message: 'Anime removed from watchlist' });
        } else {
            res.status(400).json({ message: 'Anime not found in watchlist' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export default mongoose.model('User', userSchema);
