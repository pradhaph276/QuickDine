import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect=async(req:AuthRequest,res:Response,next:NextFunction): Promise<void>=>{
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){

             try{

            // get the token from the header
            token=req.headers.authorization.split(" ")[1];


            // verify token and get the user id from the token
            const decoded=jwt.verify(token,process.env.JWT_SECRET as string) as {id:string};

            // get the user from the database
            const user=await User.findById(decoded.id).select("-password");

            if(!user){
                res.status(401).json({
                    success:false,
                    message:"Not authorized user not found"
                })
                return;
            }

           req.user=user;
           next();

        }catch(error){
            console.error(error);
            res.status(401).json({
                success: false,
                message: "Not authorized, token failed",
            });
        }
        }

        if(!token){
            res.status(401).json({
                success: false,
                message: "Not authorized, no token",
            });
        }
    }

export const adminOnly=(req:AuthRequest,res:Response,next:NextFunction):void=>{
    if(req.user && req.user.role==="admin"){
        next();
    }else{
        res.status(403).json({
            success:false,
            message:"Access denied, admin only"
        })
    }

       

}


export const ownerOnly=(req:AuthRequest,res:Response,next:NextFunction):void=>{
    if(req.user && req.user.role==="owner"|| req.user &&req.user.role==="admin"){
        next();
    }else{
        res.status(403).json({
            success:false,
            message:"Access denied, owner only"
        })
    }

       

}

