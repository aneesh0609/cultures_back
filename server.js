import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true
}));

// Routes
app.get("/", (req, res) => {
  res.send("Hii from server 1 ");
});

// Start server
app.listen(PORT, () => {
  console.log(` Server started at ${PORT}`);
});

app.listen(8000,() => {
  console.log()
})
