import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0, 
    },

    category: {
      type: String,
      required: true,
      enum: ["men", "women", "kids", "accessories", "unisex"], 
    },

    brand: {
      type: String,
      default: "Culture's", 
    },

    sizes: {
      type: [String], //  ["S", "M", "L", "XL"]
      default: ["M"],
    },

    colors: {
      type: [String], // : ["red", "black", "white"]
      default: ["black"],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String], // store image URLs
      required: true,
    },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    createdAt: {
    type: Date,
    default: Date.now,
  }
  },
  { timestamps: true } 
);

export default productSchema;
