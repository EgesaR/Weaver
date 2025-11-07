import jwt from "jsonwebtoken";
import {
  networkInterfaces
} from "os";

export const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({
    userId
  }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

// --- Get local LAN IP ---
export const getLocalIP = () => {
  const interfaces = networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === "IPv4" && !details.internal && details.address.startsWith("192.168.43.")) {
        return details.address;
      }
    }
  }
  return "0.0.0.0"; // Fallback
}