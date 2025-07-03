require("dotenv").config();
const express = require("express");
const app = express();
const bodyParse = require("body-parser");
const db = require('./config/db');
db();

const authRoute = require('./routes/authRoutes');

app.use(bodyParse.json());

app.use('/auth', authRoute);

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log("Error while conencting with server", err);
  }
  console.log("Server is running on port", process.env.PORT);
});
