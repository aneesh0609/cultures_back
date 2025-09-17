import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import 'dotenv/config';

import { initModels } from "./config/bind.js";
import Route from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoutes.js";
import orderRoute from "./routes/orderRoutes.js";



const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true
}));

// init DB + models
await initModels();

// Routes
app.get("/", (req, res) => {
  res.send("Hii from server 1 ");
});

app.use('/api/auth' , Route);
app.use('/api/product' , productRoute);
app.use('/api/user' , userRoute);
app.use('/api/cart' , cartRoute);
app.use('/api/order' , orderRoute);

// Start server
app.listen(PORT, () => {
  console.log(` Server started at ${PORT}`);
});


