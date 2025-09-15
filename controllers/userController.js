
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
