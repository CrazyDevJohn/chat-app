import bcrypt from "bcryptjs";

import cloudinery from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import { genarateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "Please required all fields!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user)
      return res.status(400).json({
        message: "Email already exists",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //   gen jwt token
      genarateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "invalid user data" });
    }
  } catch (err) {
    console.log("Error in signup controller ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const ispasswordCurrect = await bcrypt.compare(password, user.password);

    if (!ispasswordCurrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    genarateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log("Error in login controller ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("CHAT_APP_JWT_TOKEN", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successully" });
  } catch (err) {
    console.log("Error in log out controller ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required!" });
    }

    const uploadResponse = await cloudinery.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log("Error in update proffile controller ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    console.log("Error in checckAuth controller ", err.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
