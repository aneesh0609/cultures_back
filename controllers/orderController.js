import { Cart, Product, Order } from "../config/bind.js";

export const createOrder = async (req, res) => {
  const userId = req.user?.id;
  const { shippingAddress } = req.body;

  try {
   
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine1 ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide complete shipping details (name, phone, address, city, state, pincode)",
      });
    }

    //  Get user cart with product details

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: Product,
      select: "price name",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    //  Calculate subtotal

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      subtotal += item.productId.price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      };
    });

    subtotal = Number(subtotal.toFixed(2));

    //  GST & Shipping Calculation

    const gstAmount = Number((subtotal * 0.05).toFixed(2));
    const shippingCharges = Number((subtotal > 999 ? 0 : 50).toFixed(2));
    const totalAmount = Number((subtotal + gstAmount + shippingCharges).toFixed(2));

    // Create Order 

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,         //  Save subtotal
      gstAmount,        // Save GST
      shippingCharges,  // Save shipping charges
      totalAmount,      //  Save final total
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    //  Clear cart after order placement
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
