import bcrypt from "bcryptjs";
import { User } from "../config/bind.js";



export const getAllUsers = async (req, res) => {
  try {
  
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only."
      });
    }

    const users = await User.find().select("-password"); 

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching users."
    });
  }
};






export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password, oldPassword, ...updates } = req.body;


    if (updates.role) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update role",
      });
    }

    // Fetch current user to verify old password if needed

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If user wants to change password, verify old password first

    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ success: false, message: "Old password is required to set a new password" });
      }

      const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Old password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    //  Update user profile (name, email, etc.)
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password"); 
    return res.status(200).json({ success: true, updatedUser });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

