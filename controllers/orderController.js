import { Cart, Product } from "../config/bind.js";
import Order from "../models/orderSchema.js";

export const createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { shippingAddress } = req.body;

  try {
    if (!userId)
      return res.status(400).json({ success: false, message: "Please login again" });

   
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.addressLine1 || 
        !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.postalCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping details (name, phone, address, city, state, pincode)",
      });
    }


    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: Product,
      select: "price name", 
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }



    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      totalAmount += item.productId.price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price, 
      };
    });

    // ✅ Create Order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
