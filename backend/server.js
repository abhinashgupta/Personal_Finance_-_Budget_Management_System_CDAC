// server.js
require("dotenv").config(); // Load environment variables first!
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require('./config/db'); // Import your DB connection
// const morgan = require('morgan'); // Optional: for logging requests

// --- Database Connection ---
connectDB();

// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173",
  "https-fintrack-frontend-xyz.onrender.com", // Your local frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  // This is the crucial part for your error
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));




// --- Middleware ---
app.use(express.json()); // Body parser for JSON data
app.use(cookieParser()); // Cookie parser for req.cookies
// app.use(morgan('dev')); // Optional: HTTP request logger

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
// Note: If you had separate 'incomeRoutes' earlier, remember income transactions are handled
// within transactionRoutes now (via 'type: income').

// --- Mount Routes ---
app.use('/auth', authRoutes); // Auth routes (register, login, logout, get all users)
app.use('/users', userRoutes); // User profile routes
app.use('/categories', categoryRoutes); // Category CRUD
app.use('/transactions', transactionRoutes); // Transaction CRUD and charts data
app.use('/budgets', budgetRoutes); // Budget CRUD

// --- Simple Root Route ---
app.get("/", (req, res) => {
    res.send("API is running...");
});

// --- Global Error Handling Middleware (MUST BE LAST) ---
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the stack trace for debugging
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong on the server!';
    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// --- Server Listening ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if (err) {
        console.error("Error while connecting with server:", err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});