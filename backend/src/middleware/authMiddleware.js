// Mock authentication middleware for development
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Mock user validation
  const mockUsers = {
    'netrunnerX': { id: 'netrunnerX', role: 'admin', username: 'netrunnerX' },
    'reliefAdmin': { id: 'reliefAdmin', role: 'contributor', username: 'reliefAdmin' }
  };
  
  const user = mockUsers[token];
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Add user info to request
  req.user = user;
  next();
};

module.exports = {
  authMiddleware
}; 