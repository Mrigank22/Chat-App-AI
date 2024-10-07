// Middleware to authenticate using JWT
const jwt = require('jsonwebtoken'); 
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the header
  
    if (!token) return res.status(401).json({ error: 'Token required' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      
      req.user = user; // Attach user info to request
      next();
    });
  };
  
module.exports=authenticateJWT;