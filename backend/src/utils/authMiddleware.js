const users = [
  { id: 'netrunnerX', role: 'admin' },
  { id: 'reliefAdmin', role: 'contributor' }
];

// Middleware to assign user based on header or round-robin (for demo)
let userIndex = 0;
module.exports = (req, res, next) => {
  // Use x-user header if provided
  const userId = req.header('x-user');
  const user = users.find(u => u.id === userId) || users[userIndex];
  req.user = user;
  // Round-robin for next request if no header
  if (!userId) userIndex = (userIndex + 1) % users.length;
  next();
}; 