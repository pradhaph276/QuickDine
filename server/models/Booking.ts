import mongoose, {model,Types, Schema, Document } from "mongoose";

export interface IBooking extends Document {
  referenceCode: string;
  restaurant: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  time: string;
  guests: number;
  specialRequests?: string;
  occasion?: string;
  status: "pending" | "confirmed" | "cancelled";
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    specialRequests: {
      type: String,
      trim: true,
      default: "",
    },

    occasion: {
      type: String,
      enum: [
        "Birthday",
        "Anniversary",
        "Business Meeting",
        "Family Dinner",
        "Date Night",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    referenceCode: {
  type: String,
  unique: true,
},
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", function () {
  if (!this.referenceCode) {
    this.referenceCode = `BK-${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);


export default Booking;