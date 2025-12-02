import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  // Try to get token from cookie first (for httpOnly cookies)
  let token = req.cookies?.authToken;
  
  // Fallback to Authorization header if no cookie
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (token == null) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}