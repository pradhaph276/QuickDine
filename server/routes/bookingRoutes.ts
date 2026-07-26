import { Router } from "express";
import { cancelbooking, createbooking, getmybookings } from "../controllers/bookingController.js";
import { protect } from "../middlewares/auth.js";




const BookingRouter=Router();

BookingRouter.post("/",protect,createbooking);
BookingRouter.get("/my",protect,getmybookings);
BookingRouter.put("/:id/cancel", protect, cancelbooking);



export default BookingRouter;