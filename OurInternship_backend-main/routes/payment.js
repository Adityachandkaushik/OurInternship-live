// routes/payment.js
import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Use process.env (no await needed for constructor)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount) return res.status(400).json({ message: "Amount required" });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

export default router;
