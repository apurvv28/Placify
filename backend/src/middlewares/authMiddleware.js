const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'change_me';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
};
