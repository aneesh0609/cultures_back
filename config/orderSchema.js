import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, 
});


const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },        // Person's name
  phone: { type: String, required: true },           // Contact number
  addressLine1: { type: String, required: true },    // House/Flat/Building
  addressLine2: { type: String },                    // Optional (Landmark, Apartment name)
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },      // Pincode
  country: { type: String, default: "India" },       // Default country
  nearbyLocation: { type: String },                  // Additional info for delivery person
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    shippingCharges: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled" , "confirmed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);


export default orderSchema;
