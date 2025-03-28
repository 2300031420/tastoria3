const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    console.log('Auth Middleware - Headers:', req.headers);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
        console.log('No Authorization header found');
        return res.status(401).json({ message: 'No Authorization header found' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token ? 'Present' : 'Not present');
    
    if (!token) {
        console.log('No token found in Authorization header');
        return res.status(401).json({ message: 'No token found in Authorization header' });
    }

    try {
        // Verify token
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', { ...decoded, iat: undefined }); // Log decoded token without sensitive timestamp
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ 
            message: 'Token is not valid',
            error: err.message 
        });
    }
}; 