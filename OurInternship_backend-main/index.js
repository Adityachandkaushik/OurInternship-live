import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import internshipRoutes from "./routes/internship.routes.js";
import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/student.js";
import paymentRoutes from "./routes/payment.js";
import receiptRoutes from "./routes/receipt.js";
import certificateRoutes from "./routes/certificate.routes.js";
import offerRoutes from "./routes/offerletter.route.js";
import connectCloudinary from "./utils/cloudinary.js";

dotenv.config();
connectCloudinary();
const app = express();
// Middlewares
app.use(cors({
    origin: "http://localhost:5173", // ❗ exact frontend URL
    credentials: true               // ❗ allow cookies
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/offers",offerRoutes)
app.get("/", (req, res) => {
  res.send("Event API Running");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
