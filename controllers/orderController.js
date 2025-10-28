import { Cart, Product, Order , User} from "../config/bind.js";

// 🧾 USER: Create Order
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

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: Product,
      select: "price name",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

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

    const gstAmount = Number((subtotal * 0.05).toFixed(2));
    const shippingCharges = Number((subtotal > 999 ? 0 : 50).toFixed(2));
    const totalAmount = Number((subtotal + gstAmount + shippingCharges).toFixed(2));

    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      gstAmount,
      shippingCharges,
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
      summary: { subtotal, gstAmount, shippingCharges, totalAmount },
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🧾 USER: Get Orders
export const getOrders = async (req, res) => {
  const userId = req.user?.id;
  try {
    const orders = await Order.find({ userId })
      .populate({
        path: "items.productId",
        model: Product,
        select: "name price images",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🧾 USER: Get Order by ID
export const getOrderById = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, userId }).populate({
      path: "items.productId",
      model: Product,
      select: "name price images",
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🧾 USER: Cancel Order
export const cancelOrder = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled once processed/shipped",
      });
    }

    order.status = "cancelled";

    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    // ✅ Check if the user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // ✅ Fetch all orders with related data
    const orders = await Order.find()
      .populate({
        path: "userId",
        model: User,
        select: "name email", // User info
      })
      .populate({
        path: "items.productId",
        model: Product,
        select: "name price images", // Product info
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Admin Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ✅ Get all orders for a specific user (even if stored in another DB)
export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists in main DB
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch orders from the secondary DB
    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      user: {
        name: user.name,
        email: user.email,
      },
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};