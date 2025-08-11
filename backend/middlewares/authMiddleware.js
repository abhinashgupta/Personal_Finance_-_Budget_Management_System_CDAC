const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided or it's not a Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token is missing from the header.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret_key);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error while verifying token:", error);
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token.",
      success: false,
    });
  }
};

module.exports = authMiddleware;
