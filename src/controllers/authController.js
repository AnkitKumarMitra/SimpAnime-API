import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the email is already registered
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Check if the username is already taken
    existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({ fullName, username, email, password: hashedPassword });
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refreshToken in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Set the tokens as cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login Logic
export const loginUser = async (req, res) => {
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

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refreshToken in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Set the tokens as cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: 'Logged in successfully', user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(403).json({ error: 'Refresh token not provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(204).json({ message: 'No content' });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(204).json({ message: 'Logged out' });
    }
    
    user.refreshToken = '';
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(204).json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
