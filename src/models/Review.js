import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    animeId: { type: String, required: true }, // Can store anime ID or title
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

export const updateReview = async (req, res) => {
    try {
        const { reviewId, rating, comment } = req.body;
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default mongoose.model('Review', reviewSchema);
