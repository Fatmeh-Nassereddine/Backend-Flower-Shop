// const jwt = require('jsonwebtoken');

// //  Middleware to authenticate Routes (Require Logged-In User)
// exports.authenticate = (req, res, next) => {
//     try {
//         console.log("Request Headers:", req.headers); // Log the headers
//         console.log("Request Cookies:", req.cookies);  // Log the cookies
//         // Try to fetch the token from both places (cookies and header)
//         const tokenFromCookies = req.cookies.token;
//         const tokenFromHeader = req.headers.authorization?.split(' ')[1];
//         const token = tokenFromCookies || tokenFromHeader;
//         console.log("Extracted Token:", token);  // Log the extracted token

//         if (!token) {
//             console.log("No token found in request");
//             return res.status(401).json({ error: 'Unauthorized, no token found' });
//         }

       

//         // Decode the token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         console.log('Token Expiry:', new Date(decoded.exp * 1000));  // Check token expiry time

//         req.user = decoded;  // Attach the decoded user to request
//         // Debugging: Check the user object attached to the request
//         console.log('User attached to req:', req.user);

//         next();
//     } catch (error) {
//         console.error("Error decoding token:", error);  // Log the error for debugging
//         return res.status(401).json({ error: 'Invalid or expired token' });
//     }
// };


// // Admin authorization (no changes needed)
// exports.authorizeAdmin = (req, res, next) => {
//     try {
//         console.log('Authorize Admin - req.user:', req.user);  // Debugging the user object
//         if (!req.user || req.user.role !== 'admin') {
//             console.log('Authorize Admin - req.user:', req.user);
//             return res.status(403).json({ error: 'Access denied! Admins only.' });
//         }
//         next();
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };


// // Customer authorization (no changes needed)
// exports.authorizeCustomer = (req, res, next) => {
//     console.log("👤 authorizeCustomer -> req.user:", req.user);  // Debugging user role
//     if (!req.user || req.user.role !== 'customer') {
//         return res.status(403).json({ error: 'Access denied! Customers only.' });
//     }
//     next();
// };




const jwt = require('jsonwebtoken');
const User = require('../models/user');

// ✅ Auth middleware
const authenticate = async (req, res, next) => {
  console.log("Authenticating...");
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    console.log('Decoded JWT:', decoded); 
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    console.log('Authenticated user:', req.user); // Log the user object for debugging

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};



// ✅ Specific admin-only middleware
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

module.exports = { authenticate,  authorizeAdmin };
