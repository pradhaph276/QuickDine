import { Router } from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";



const AuthRouter=Router();

AuthRouter.post("/register",registerUser);
AuthRouter.post("/login",loginUser);
AuthRouter.get("/me", protect, getMe);

export default AuthRouter;