const jwt = require('jsonwebtoken');
const User = require('./models/user'); // Assuming you have a User model

const authMiddleware = async (req, res, next) => {
  // Get token from authorization header (Bearer token)
  const token = req.headers['authorization']?.split(' ')[1]; 
  
  // Check if token is missing
  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'No authentication token, authorization denied' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log('Decoded token:', decoded);  // Log decoded token for debugging

    // Fetch the user associated with the decoded id
    const user = await User.findById(decoded.id); 

    // Check if user exists
    if (!user) {
      console.error('User not found for the token');
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach the user data to the request object
    req.user = user;  
    next();  // Pass control to the next middleware/route handler

  } catch (err) {
    // Log the error and the provided token for debugging
    console.error('Token verification error:', err.message);
    console.error('Token provided:', token);  // This helps debug invalid/malformed tokens
    
    // Handle different JWT errors (e.g., expired token)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }

    // Default error for invalid token
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
