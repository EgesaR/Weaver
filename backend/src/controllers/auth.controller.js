import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateToken,
  getLocalIP
} from "../lib/utils.js";
import fs from "fs";
import path from "path";

const ip = getLocalIP();
const PORT = process.env.PORT || 5001;
const backendUrl = `http://${ip}:${PORT}`

// ------------------- SIGNUP -------------------
export const signup = async (req, res) => {
  const {
    fullName,
    email,
    password
  } = req.body;

  try {
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: null,
    });

    if (newUser) {
      generateToken(newUser._id, res);

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic ?? null,
      });
    } else {
      return res.status(400).json({
        message: "Invalid user data"
      });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  const {
    email,
    password
  } = req.body;

  try {
    const user = await User.findOne({
      email
    });
    if (!user) return res.status(400).json({
      message: "Invalid credentials"
    });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Invalid email or password"
    });

    generateToken(user._id, res);

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic ?? null,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// ------------------- LOGOUT -------------------
export const logout = (req, res) => {
  res.clearCookie("jwt");
  return res.json({
    message: "Logged out successfully"
  });
};

// ------------------- UPDATE PROFILE PIC -------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        message: "No profile picture uploaded"
      });
    }

    const data = await User.find({
      _id: userId
    }).exec();
    const user = data[0]
    if (!user) return res.status(404).json({
      message: "User not found"
    });

    // Remove old profile pic if exists
    if (user.profilePic) {
      const oldPath = path.join("public/uploads", user.profilePic);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new one
    user.profilePic = `${backendUrl}/uploads/${req.file.filename}`;
    //await user.save();

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: `${backendUrl}/uploads/${req.file.filename}`,
      message: "Profile picture updated successfully",
    });

  } catch (error) {
    console.error("Error updating profile picture:", error.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// ------------------- CHECK AUTH -------------------
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};