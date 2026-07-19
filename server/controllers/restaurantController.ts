import { Request, Response } from "express";
import Restaurant from "../models/Restaturant.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// Get all restaurants with search and filters
// Get api/restaurants
export const getAllRestaurants = async (req: Request,res: Response,): Promise<void> => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;

    // Build query object
    const queryObj: any = { status: "approved" };

    // Search by restaurant name, cuisine, chef or tags
    if (search) {
      queryObj.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Price Range
    if (priceRange) {
      queryObj.priceRange = priceRange;
    }

    // Minimum Rating
    if (rating) {
      queryObj.rating = {
        $gte: Number(rating),
      };
    }

    // Location
    if (location) {
      queryObj.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Sorting
    let sortObj: any = {
      createdAt: -1,
    };

    switch (sort) {
      case "rating":
        sortObj = { rating: -1 };
        break;

      case "price-low":
        sortObj = { priceRange: 1 };
        break;

      case "price-high":
        sortObj = { priceRange: -1 };
        break;

      case "name":
        sortObj = { name: 1 };
        break;

      default:
        sortObj = { createdAt: -1 };
    }

    const restaurants = await Restaurant.find(queryObj).sort(sortObj);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//   Get featured and exclusive restaurants

//   GET api/restaurants/featured

export const getFeaturedRestaurants = async (req: Request,res: Response,): Promise<void> => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: featured.length,
      restaurants: featured,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//   Get single restaurant by slug

//   GET api/restaurants/:slug

export const getRestaurantBySlug = async (req: Request,res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // Find restaurant by slug only
    const restaurant = await Restaurant.findOne({ slug });

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // If restaurant is not approved, allow only owner or admin
    if (restaurant.status !== "approved") {
      let isAuthorized = false;

      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];

          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "secret"
          ) as { id: string };

          const user = await User.findById(decoded.id);

          if (user) {
            // Admin can view any restaurant
            if (user.role === "admin") {
              isAuthorized = true;
            }

            // Owner can view only their own restaurant
            if (
              user.role === "owner" &&
              restaurant.owner.toString() === user._id.toString()
            ) {
              isAuthorized = true;
            }
          }
        } catch (error) {
          // Invalid token
        }
      }

      if (!isAuthorized) {
        res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this restaurant.",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: "Restaurant fetched successfully",
      restaurant,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// Get dynamic seat availability for slots

// GET api/restaurants/:id/availability


export const getRestaurantAvailability=async(req:Request,res:Response):Promise<void>=>{

try{
    const{date}=req.query;

    // Validate date
    if(!date){
        res.status(400).json({message:"Please provide a date"});
        return;
    }

    const restaurant=await Restaurant.findById(req.params.id);

    if(!restaurant){
        res.status(404).json({message:"Restaurant not found"});
        return;
    }

    const bookingDate=new Date(date as string);

    // GET all active  bookings on this date for restaurant 

     const bookings =await Booking.find({
      restaurant :restaurant._id,
      date:bookingDate,
      status:"confirmed",
     })


     // Calculate seat availability for each slot
    const availability = restaurant.availableSlots.map((slot) => {
      const bookedSeats = bookings
        .filter((booking) => booking.time === slot)
        .reduce((total, booking) => total + booking.guests, 0);

      return {
        slot,
        totalSeats: restaurant.totalSeats,
        bookedSeats,
        availableSeats: Math.max(
          restaurant.totalSeats - bookedSeats,
          0
        ),
        isAvailable: bookedSeats < restaurant.totalSeats,
      };
    });


    res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
      },
      date: bookingDate.toISOString().split("T")[0],
      totalSeats: restaurant.totalSeats,
      availability,
    });


}catch(error:any){
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
}

}

