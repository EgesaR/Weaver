import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import config from "../config/config.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) return res.status(401).json({
      message: "Unauthorized - No token provided"
    });

    const decoded = jwt.verify(token, config.jwtSecret)

    if (!decoded?.userId) return res.status(401).json({
      message: "Unauthorized - No token provided"
    });

    const user = await User.find({
      _id: decoded.userId
    }).select('-password').exec()

    if (!user.length) return res.status(404).json({
      message: "User not found"
    });

    req.user = user[0]

    next()
  } catch(error) {
    console.log("Error in protectRoute middleware: ", error.message)
    const isInvalidToken = error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError";
    res.status(isInvalidToken ? 401 : 500).json({
      message: isInvalidToken ? "Unauthorized - Invalid token" : "Internal Server Error"
    })
  }
}