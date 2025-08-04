const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.jwt_secret_key);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error while verifying token:", error);
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
            success: false,
        });
    }
};

module.exports = authMiddleware;