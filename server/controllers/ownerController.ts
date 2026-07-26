import { Response } from "express"
import { AuthRequest } from "../middlewares/auth.js"
import Restaurant from "../models/Restaturant.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import Booking from "../models/Booking.js";


// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer: Buffer,folder: string = "QuickDine"): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result) {
          return reject(new Error("Upload failed"));
        }

        resolve({
          secure_url: result.secure_url,
        });
      }
    );

    stream.end(fileBuffer);
  });
};

// Get owner's Restaurants
// GET api/owner/restaurant


export const getOwnerRestaurant=async(req:AuthRequest,res:Response):Promise<void>=>{

    try{

        const restaurant = await Restaurant.findOne({owner: req.user?._id,
    });

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });

    }catch(error:any){

        console.log(error)
        res.status(400).json({message:error.message})

    }
}


// Create  owner's Restaurants(submitted to Pending)
// POST api/owner/restaurant

export const createOwnerRestaurant=async(req:AuthRequest,res:Response):Promise<void>=>{

    try{

          const {
  name,
  description,
  cuisine,
  priceRange,
  phone,
  email,
  address,
  city,
  state,
  zipCode,
  openingHours,
  tags,
  availableSlots,
} = req.body;
           // Validation
    if (!name || !description ||!cuisine ||!priceRange ||!phone ||!address ||!city ||!state) {
      res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
      return;
    }


    // Prevent duplicate restaurant (optional)
    const existingRestaurant = await Restaurant.findOne({
      owner: req.user?._id,
    });

    if (existingRestaurant) {
      res.status(400).json({
        success: false,
        message: "You have already created a restaurant.",
      });
      return;
    }


     // Generate unique slug
    let slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const slugExists = await Restaurant.findOne({ slug });

    // Handle image

    let imageUrl="";

   if (req.file) {
     const result = await uploadToCloudinary(req.file.buffer);
     imageUrl = result.secure_url;
    }



    // setup parsed tags and slots

    // Parse tags
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];

    // Parse available slots
    const parsedSlots =
      typeof availableSlots === "string"
        ? availableSlots.split(",").map((slot) => slot.trim())
        : availableSlots || [
            "17:00",
            "18:00",
            "19:00",
            "20:00",
            "21:00",
          ];

          const parsedOpeningHours =
  typeof openingHours === "string"
    ? JSON.parse(openingHours)
    : openingHours;

    const parsedCuisine =
  typeof cuisine === "string"
    ? cuisine.split(",").map((item) => item.trim())
    : cuisine || [];


           // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      slug,
      description,
      cuisine: parsedCuisine,
      priceRange,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      openingHours: parsedOpeningHours,
      image: imageUrl,
      tags: parsedTags,
      availableSlots: parsedSlots,
      owner: req.user?._id,
      status: "pending",
    });


res.status(201).json({
      success: true,
      message: "Restaurant submitted successfully for approval.",
      data: restaurant,
    });


    }catch(error:any){
        console.log(error)
        res.status(400).json({message:error.message})
    }
}


// update   owner's Restaurants
// PUT api/owner/restaurant

export const updateOwnerRestaurant = async (req: AuthRequest,res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({owner: req.user?._id,});
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
      return;
    }


    const {
      name,
      description,
      cuisine,
      priceRange,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      location,
      chef,
      totalSeats,
      openingHours,
      tags,
      availableSlots,
    } = req.body;

     if (name) restaurant.name = name;
     if (priceRange) restaurant.priceRange = priceRange;
    if (phone) restaurant.phone = phone;
    if (email) (restaurant as any).email = email;
    if (address) restaurant.address = address;
    if (city) (restaurant as any).city = city;
    if (state) (restaurant as any).state = state;
    if (zipCode) (restaurant as any).zipCode = zipCode;
    if (location) restaurant.location = location;
    if (chef) restaurant.chef = chef;
    if (totalSeats) restaurant.totalSeats = Number(totalSeats);

     if (tags) {
      restaurant.tags =
        typeof tags === "string"
          ? tags.split(",").map((tag: string) => tag.trim())
          : tags;
    }


       if (availableSlots) {
      restaurant.availableSlots =
        typeof availableSlots === "string"
          ? availableSlots.split(",").map((slot: string) => slot.trim())
          : availableSlots;
    }

    if (cuisine) {
  restaurant.cuisine =
    typeof cuisine === "string"
      ? cuisine.split(",").map((item: string) => item.trim())
      : cuisine;
}

if (openingHours) {
  (restaurant as any).openingHours =
    typeof openingHours === "string"
      ? JSON.parse(openingHours)
      : openingHours;
}

if (name && name !== restaurant.name) {
  restaurant.name = name;
  restaurant.slug = slugify(name, {
    lower: true,
    strict: true,
  });
}

    // Upload new image
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "restaurants");
      restaurant.image = result.secure_url;
    }

    const updated=await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// GET booking owner's Restaurants
// GET api/owner/bookings

export const getOwnerBookings=async(req:AuthRequest,res:Response):Promise<void>=>{

    try{

           const restaurants = await Restaurant.find({owner: req.user?._id,})

            if (!restaurants) {
      res.status(404).json({
        success: false,
        message: "No restaurants found.",
      });
      return;
    }


     // Get restaurant ids
    const restaurantIds = restaurants.map((restaurant) => restaurant._id);

    // Fetch bookings
    const bookings = await Booking.find({
      restaurant: { $in: restaurantIds },
    })
      .populate("user", "name email phone")
      .populate("restaurant", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

    }catch(error:any){
         console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
        
    }
}


// update status of a booking 
// PUT  api/owner/bookings/:id/status

export const updateBookingStatus=async(req:AuthRequest,res:Response):Promise<void>=>{
try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(id).populate("restaurant");

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
      return;
    }

    // Check ownership
    if (
      (booking.restaurant as any).owner.toString() !==
      req.user?._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this booking.",
      });
      return;
    }

    // Update status
    booking.status = status;

    const updatedBooking = await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
