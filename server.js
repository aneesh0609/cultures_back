import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import hpp from "hpp";
import morgan from "morgan";
import "dotenv/config";

import { initModels } from "./config/bind.js";


import Route from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoutes.js";
import orderRoute from "./routes/orderRoutes.js";
import paymentRouter from "./routes/paymentRoute.js";
import { generalLimiter } from "./middleware/rateLimitMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const app = express();
const PORT = process.env.PORT || 8000;

// -------- Security Middlewares --------
app.use(helmet());
app.use(generalLimiter);

// app.use(mongoSanitize());

app.use(hpp());
app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

// -------- Logger --------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// -------- Core Middlewares --------
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// -------- Init DB + Models --------
await initModels();

// -------- Routes --------
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running ✅" });
});

app.use("/api/auth", Route);
app.use("/api/product", productRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRouter);

// -------- Error Handling --------
app.use(notFoundHandler);
app.use(errorHandler);

// -------- Start Server --------
app.listen(PORT, () => {
  console.log(` Server started at http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
});
