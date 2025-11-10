import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  User
} from "../models/user.model.js";
import {
  getBaseUrl
} from "../utils/getBaseUrl.js";
import config from "../config/config.js";

const JWT_SECRET = config.jwtSecret;

export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      bio
    } = req.body;
    const userId = req.user._id;
    let newProfilePic = null;

    if (req.file) {
      newProfilePic = `${getBaseUrl()}/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        ...(newProfilePic && {
          profilePic: newProfilePic
        }),
      },
      {
        new: true
      }
    );

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      email: updatedUser.email,
    });
  } catch (err) {
    console.error("Error in updateProfile:", err.message);
    res.status(500).json({
      message: "Server error"
    });
  }
};