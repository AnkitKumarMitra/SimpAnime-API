import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
export default authenticateJWT