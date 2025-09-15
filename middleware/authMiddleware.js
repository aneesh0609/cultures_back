import jwt from "jsonwebtoken";
import { User } from "../config/bind.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token ;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, login again" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // it will return whole document but .select will exclude password field from that document

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
};
