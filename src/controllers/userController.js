import User from '../models/User.js';
import Review from '../models/Review.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register User
/* export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the email is already registered
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Check if the username is already taken
    existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({ fullName, username, email, password: hashedPassword });
    await user.save();

    // Create a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set cookie with token
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

    // Respond with user details and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; */

// Login User
/* export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User Not Found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie with token
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

    // Respond with user details and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; */
// Add to Watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.body;

    if (!userId || !animeId) {
      return res.status(400).json({ error: 'User ID and Anime ID are required' });
    }

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

// Remove from Watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.body;

    if (!userId || !animeId) {
      return res.status(400).json({ error: 'User ID and Anime ID are required' });
    }

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

// Add Review
export const addReview = async (req, res) => {
  try {
    const { userId, animeId, rating, comment } = req.body;

    if (!userId || !animeId || rating == null) {
      return res.status(400).json({ error: 'User ID, Anime ID, and rating are required' });
    }

    // Validate rating (assuming it's an integer between 1 and 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = new Review({ userId, animeId, rating, comment });
    await review.save();

    const user = await User.findById(userId);
    user.reviews.push(review._id);
    await user.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;

    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (rating != null) review.rating = rating;
    if (comment != null) review.comment = comment;

    await review.save();
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const user = await User.findById(review.userId);
    user.reviews = user.reviews.filter(id => id.toString() !== reviewId);
    await user.save();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
