
import crypto from "crypto";
import { Payment } from "../config/bind.js"; // Your Payment model
import { Order } from "../config/bind.js";
import razorpay from "../config/payment.js";

// 🔑 Razorpay Instance (Test Mode)
// ⚠️ Switch key_id & key_secret to LIVE mode later


export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body; // Order from your DB
    const userId = req.user?.id;

    // ✅ Fetch order from DB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Prepare Razorpay order options
    const options = {
      amount: order.totalAmount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: {
        userId,
        orderId: order._id.toString(),
      },
    };

    // ✅ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    // ✅ Store in DB (pending payment)
    const payment = await Payment.create({
      userId,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID, // send key to frontend
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("Create Payment Order Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Verify Razorpay Payment Signature
 * @route POST /api/payments/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // ✅ Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature, payment verification failed" });
    }

    // ✅ Update Payment status in DB
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    // ✅ Update Order status to 'confirmed'
    if (payment) {
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: "paid",
        status: "confirmed",
      });
    }

    return res.status(200).json({ success: true, message: "Payment verified successfully", payment });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Get Payment Status
 * @route GET /api/payments/status/:paymentId
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    return res.status(200).json({ success: true, payment });

  } catch (error) {
    console.error("Get Payment Status Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Get All Payments for a User
 * @route GET /api/payments/my-payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, payments });

  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ Missing RAZORPAY_WEBHOOK_SECRET in .env");
      return res.status(500).json({ success: false, message: "Server misconfiguration" });
    }

    // ✅ Validate Webhook Signature
    const receivedSignature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      console.error("❌ Invalid Razorpay webhook signature");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (!payload) {
      return res.status(400).json({ success: false, message: "Missing payment payload" });
    }

    console.log(`✅ Webhook Event Received: ${event}`);

    // ✅ Handle only successful payments
    if (event === "payment.captured") {
      const { order_id, id: paymentId } = payload;

      const payment = await Payment.findOne({ razorpayOrderId: order_id });

      if (!payment) {
        console.error("❌ Payment not found for webhook");
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      // Prevent duplicate updates
      if (payment.status === "paid") {
        console.log("ℹ Payment already marked as paid");
        return res.status(200).json({ success: true, message: "Already processed" });
      }

      payment.status = "paid";
      payment.razorpayPaymentId = paymentId;
      payment.razorpaySignature = "via_webhook";
      await payment.save();

      // ✅ Mark order as confirmed
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: "paid",
        status: "confirmed",
      });

      console.log(`✅ Payment ${paymentId} verified via webhook`);
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
