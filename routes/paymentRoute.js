import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  getAllPayments,
  razorpayWebhook,
} from "../controllers/paymentController.js";


import { protect } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();


paymentRouter.post("/create-payment", protect, createPaymentOrder);


paymentRouter.post("/verify-payment", protect, verifyPayment);


paymentRouter.post("/webhook", express.json({ type: "application/json" }), razorpayWebhook);


paymentRouter.get("/status/:paymentId", protect, getPaymentStatus);



paymentRouter.get("/my-payments", protect, getAllPayments);



export default paymentRouter;
