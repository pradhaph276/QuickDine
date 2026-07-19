import { Router } from "express";
import { getAllRestaurants, getFeaturedRestaurants, getRestaurantAvailability, getRestaurantBySlug } from "../controllers/restaurantController.js";



const authRouter=Router();

authRouter.post("/",getAllRestaurants);
authRouter.get("/featured",getFeaturedRestaurants);
authRouter.get("/:id/availability", getRestaurantAvailability);
authRouter.get("/:slug", getRestaurantBySlug);


export default authRouter;