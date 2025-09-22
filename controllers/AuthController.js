import { User } from "../config/bind.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Internal server error."
    });
  }
};


export const signin = async (req,res) => {

  const{email,password} = req.body ;

  try {
    
    if(!email || !password)
    {
      return res.status(400).json({success: false , message: "All fields Required"})
    }

    const user = await User.findOne({email}) ;

    if(!user)
    {
       return res.status(400).json({success: false , message: "Invalid email or password"});
    }

    const comparePassword = await bcrypt.compare(password , user.password) ;
    
    if(!comparePassword)
    {
      return res.status(400).json({success: false , message : "Invalid email or password" });
    }

  const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });


        res.json({
      success: true,
      message: "User Login Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
 

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Internal server error."
    });
  }
}


export const logout = async (req,res) =>
{
        try {
      
     res.clearCookie('token',{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
       sameSite:   process.env.NODE_ENV === 'production' ? 'none' : 'strict'
     });
 
      return res.status(200).json({success: true , message: "user logged out successfully" });

    } catch (error) {
      return res.status(500).json({success: false , message: "internal server error"})
    }


}