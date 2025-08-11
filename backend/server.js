require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require('./config/db');

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://fintrack-f01u.onrender.com", 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json()); 
app.use(cookieParser()); 

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');


app.use('/auth', authRoutes); 
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes); 
app.use('/transactions', transactionRoutes); 
app.use('/budgets', budgetRoutes);


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong on the server!';
    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if (err) {
        console.error("Error while connecting with server:", err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});