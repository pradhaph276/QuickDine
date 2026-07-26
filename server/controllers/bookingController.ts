import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import Restaurant from "../models/Restaturant.js";
import Booking from "../models/Booking.js";


// Create new booking
// POST /api/bookings
// Access: Private

export const createbooking = async (req: AuthRequest,res: Response): Promise<void> => {
  try {
    const {
      restaurantId,
      date,
      time,
      guests,
      occasion,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (!restaurantId || !date || !time || !guests) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
      return;
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
      return;
    }

    // Verify restaurant is approved
    if (restaurant.status !== "approved") {
      res.status(400).json({
        success: false,
        message: "Restaurant is not approved for bookings.",
      });
      return;
    }

    // Verify selected slot exists
    if (!restaurant.availableSlots.includes(time)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking time slot.",
      });
      return;
    }

    const bookingDate = new Date(date);
    const requestedGuests = Number(guests);

    // Get confirmed bookings for same slot
    const existingBookings = await Booking.find({
      restaurant: restaurant._id,
      date: bookingDate,
      time,
      status: "confirmed",
    });

    // Calculate booked seats
    const bookedSeats = existingBookings.reduce(
      (total, booking) => total + booking.guests,
      0
    );

    const availableSeats = restaurant.totalSeats - bookedSeats;

    // Check seat availability
    if (requestedGuests > availableSeats) {
      res.status(400).json({
        success: false,
        message: `Only ${availableSeats} seats are available for this slot.`,
      });
      return;
    }

    // Create booking
    const booking = await Booking.create({
      restaurant: restaurant._id,
      user: req.user!._id,
      date: bookingDate,
      time,
      guests: requestedGuests,
      occasion,
      specialRequests,
      status: "confirmed",
    });

    const populatedBooking = await booking.populate("restaurant", "name address");


    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// get logged in user bookings
//GET  api/bookings/my
// access private 
export const getmybookings=async(req: AuthRequest,res:Response):Promise<void>=>{

    try{ 

        const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

          const bookings = await Booking.find({ user: userId })
      .populate("restaurant", "name address image cuisine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

    }catch(error){
        console.error("Error creating booking:", error);
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to create booking"
        // });
    }

}


//cancel a bookings
//PUT  api/bookings/:id/cancel
// access private 
export const cancelbooking=async(req: AuthRequest,res:Response):Promise<void>=>{
    try{ 
       const { id } = req.params;
       const userId = req.user?._id;

       // Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
      return;
    }

    // Check if user is the owner of the booking
    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this booking.",
      });
      return;
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();


    const populatedBooking = await booking.populate("restaurant", "name address");

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: populatedBooking,
    });

    }catch(error){
        console.error("Error creating booking:", error);
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to create booking"
        // });
    }

}

