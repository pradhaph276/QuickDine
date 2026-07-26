import { Router } from "express";
import { getAllRestaurants, getFeaturedRestaurants, getRestaurantAvailability, getRestaurantBySlug } from "../controllers/restaurantController.js";



const RestaurantRouter=Router();

RestaurantRouter.post("/",getAllRestaurants);
RestaurantRouter.get("/featured",getFeaturedRestaurants);
RestaurantRouter.get("/:id/availability", getRestaurantAvailability);
RestaurantRouter.get("/:slug", getRestaurantBySlug);


export default RestaurantRouter;