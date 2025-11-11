import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { getBaseUrl } from "../utils/getBaseUrl.js";

// ------------------- SIGNUP -------------------
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: null,
    });

    generateToken(res, newUser._id);

    return res.status(201).json({
      ...newUser,
      profilePic: newUser.profilePic
        ? `${getBaseUrl()}/uploads/${path.basename(newUser.profilePic)}`
        : null,
    });
  } catch (err) {
    console.error("❌ Error in signup:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(res, user._id);

    return res.status(200).json({
      ...user,
      profilePic: user.profilePic
        ? `${getBaseUrl()}/uploads/${path.basename(user.profilePic)}`
        : null,
    });
  } catch (err) {
    console.error("❌ Error in login:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------- UPDATE PROFILE PIC -------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!req.file)
      return res.status(400).json({ message: "No profile picture uploaded" });

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove old picture
    if (user.profilePic) {
      const oldPath = path.join(
        "public/uploads",
        path.basename(user.profilePic)
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const newProfilePic = `${getBaseUrl()}/uploads/${req.file.filename}`;
    const updatedUser = await User.patch(userId, { profilePic: newProfilePic });

    return res
      .status(200)
      .json({
        ...updatedUser,
        message: "Profile picture updated successfully",
      });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------- LOGOUT -------------------
export const logout = (req, res) => {
  res.clearCookie("jwt");
  return res.json({ message: "Logged out successfully" });
};

// ------------------- CHECK AUTH -------------------
export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    console.error("❌ Error in checkAuth:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
