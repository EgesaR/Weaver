import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateToken = (res, userId) => {
  try {
    const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.nodeEnv === "production", // only https in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
  } catch (err) {
    console.error("❌ Error creating JWT:", err.message);
    throw new Error("Token generation failed");
  }
};
