// Mock users and roles
const users = {
  netrunnerX: { username: 'netrunnerX', role: 'admin' },
  reliefAdmin: { username: 'reliefAdmin', role: 'admin' },
  volunteerJoe: { username: 'volunteerJoe', role: 'contributor' },
  demoUser: { username: 'demoUser', role: 'contributor' },
};

function authMiddleware(req, res, next) {
  const username = req.header('x-user');
  if (!username || !users[username]) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-user header' });
  }
  req.user = users[username];
  next();
}

module.exports = authMiddleware; 