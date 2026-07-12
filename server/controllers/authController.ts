import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AuthRequest } from "../middlewares/auth.js";





const generateToken=(id:string)=>{
    return jwt.sign({id},process.env.JWT_SECRET as string,{
        expiresIn:"30d"
    })

}

// Register a new user
// POST /api/auth/register
export const registerUser = async (req: Request,res: Response): Promise<void> => {


  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Generate JWT
    const token =generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Authenticate a user &  get token
// POST/api/auth/login
export const loginUser=async(req:Request,res:Response):Promise<void>=>{

    try{

        const {  email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Check existing user
    const user = await User.findOne({ email });


     // check user
    if (!user) {
      res.status(400).json({message:"Invalid usernmae or password",});
      return;
    }

    //   check password match

    const isMatch=await bcrypt.compare(password,user.password || "");

    if (!isMatch) {
      res.status(400).json({
         success: false,
         message: "Invalid email or password",
      });
      return;
    }


    // Generate Token
const token = generateToken(user._id.toString());

 
    res.status(201).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });


    }catch(error){
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    }
}

// GET User Profile 
// GET /api/auth/me
export const getMe=async(req:AuthRequest,res:Response):Promise<void>=>{

    try {

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}