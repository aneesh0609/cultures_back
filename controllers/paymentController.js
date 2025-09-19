
import crypto from "crypto";
import { Payment, Order } from "../config/bind.js"; // Models
import razorpay from "../config/payment.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { sendEmail } from "../utils/sendmail.js";

/**
 * @desc Create Razorpay Order (SECURE)
 * @route POST /api/payments/create-order
 * @access Private (requires isAuthenticated middleware)
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    // ✅ Fetch order securely
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or does not belong to this user" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    // ✅ Always recalculate total amount on backend (for security)
    const totalAmount = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    if (totalAmount !== order.totalAmount) {
      return res.status(400).json({ success: false, message: "Order amount mismatch. Cannot proceed." });
    }

    // ✅ Create Razorpay order
    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: { userId, orderId: order._id.toString() },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // ✅ Save payment in DB
    const payment = await Payment.create({
      userId,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
      status: "created",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("Create Payment Order Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Verify Razorpay Payment
 * @route POST /api/payments/verify
 * @access Private (requires isAuthenticated middleware)
 */

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    // ✅ Generate expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature, possible fraud detected" });
    }

    // ✅ Find and update payment
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status === "paid")
      return res.status(400).json({ success: false, message: "Payment already verified" });

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    // ✅ Update order status
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      { paymentStatus: "paid", status: "confirmed" },
      { new: true }
    ).populate("userId"); // so we can access user details for email

    // ✅ Generate Invoice (PDF)
    const invoicePath = await generateInvoicePDF({
      order,
      payment,
      customer: order.userId,
    });

    // ✅ Send email with invoice attached
    await sendEmail({
      to: order.userId.email,
      subject: "Your Order Invoice",
      text: `Thank you for your order, ${order.userId.name}! Please find your invoice attached.`,
      attachments: [{ filename: "invoice.pdf", path: invoicePath }],
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified, order confirmed, and invoice sent",
      payment,
      order,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Get Payment Status
 * @route GET /api/payments/status/:paymentId
 * @access Private
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    const payment = await Payment.findOne({ _id: paymentId, userId });

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
 * @desc Get All Payments for Logged-in User
 * @route GET /api/payments/my-payments
 * @access Private
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
