const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Get the Authorization header from the incoming request
  const authHeader = req.headers.authorization;

  // 2. Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided or it's not a Bearer token.",
    });
  }

  // 3. Extract the token from the "Bearer <token>" string
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: Token is missing from the header.",
      });
  }

  try {
    // 4. Verify the token is valid
    const decoded = jwt.verify(token, process.env.jwt_secret_key);
    req.user = decoded; // Attach user information to the request
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
