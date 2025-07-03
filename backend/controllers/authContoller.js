const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          message: "User already exists with this email",
          success: false,
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUSer = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ message: "User Registered Successfull", success: true, newUSer });
  } catch (error) {
    console.error("Error registering user", error);
    return res
      .status(500)
      .json({ message: "Error registering user", success: false });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res
        .status(404)
        .json({ message: "User not found with this email", success: false });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      userExist.password
    );
    

    if (!isPasswordMatched) {
      return res
        .status(500)
        .json({ message: "Invalid Credentials", success: false });
      }
      
    const token = jwt.sign({ id: userExist._id, email: userExist.email }, process.env.jwt_secret_key, {expiresIn:"1h"});

    return res
      .status(200)
      .json({ message: "User Logged In Successfull", success: true, token, user:{id:userExist._id,firstname:userExist.firstname,lastname:userExist.lastname,email:userExist.email} });
      
  } catch (error) {
    console.error("Error while Logged in", error);
    return res
      .status(500)
      .json({ message: "Error while Logged in", success: false });
  }
};
