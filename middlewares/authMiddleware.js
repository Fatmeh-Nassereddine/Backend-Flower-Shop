const jwt = require('jsonwebtoken');

//  Middleware to Protect Routes (Require Logged-In User)
exports.protect = (req, res, next) => {
    try {
        // Try to fetch the token from both places (cookies and header)
        const tokenFromCookies = req.cookies.token;
        const tokenFromHeader = req.headers.authorization?.split(' ')[1];

        const token = tokenFromCookies || tokenFromHeader;

        if (!token) return res.status(401).json({ error: 'Unauthorized, no token found' });

        console.log("🔑 Token:", token); // Log the raw token for debugging

        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("🔐 Decoded Token:", decoded);  // Log the decoded token to check the contents

        req.user = decoded;  // Attach the decoded user to request

        next();
    } catch (error) {
        console.error("Error decoding token:", error);  // Log the error for debugging
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};


// Admin authorization (no changes needed)
exports.authorizeAdmin = (req, res, next) => {
    console.log("🧾 Admin Check: User Role =", req.user.role); // Debugging line to check role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied! Admins only.' });
    }
    next();
};

// Customer authorization (no changes needed)
exports.authorizeCustomer = (req, res, next) => {
    console.log("👤 authorizeCustomer -> req.user:", req.user);  // Debugging user role
    if (!req.user || req.user.role !== 'customer') {
        return res.status(403).json({ error: 'Access denied! Customers only.' });
    }
    next();
};
