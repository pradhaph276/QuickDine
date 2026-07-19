import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  description: string;
  cuisine: string[];
  priceRange: "$" | "$$" | " $$$";
  profileImage?: string;
  address: string;
  location: string;
  image: string;
  reviewCount:number;
  rating:number;
  chef: string;
  availableSlots: string[];
  tags: string[];
  featured: boolean;
  exclusive: boolean;
  owner:mongoose.Types.ObjectId;
  totalSeats: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    cuisine: [
      {
        type: String,
        required: true,
      },
    ],

    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$"],
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    chef: {
      type: String,
      required: true,
    },

    availableSlots: [
      {
        type: String,
      },
    ],

    tags: [
      {
        type: String,
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    exclusive: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      default: 20,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);



const Restaurant = mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

export default Restaurant;