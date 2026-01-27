// models/certificate.model.js
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
  },
  certificateId: {
    type: String,
    unique: true,
    default: () => `CERT-${nanoid(12)}`,
  },
  certificateNumber: {
    type: String,
    unique: true,
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  pdfUrl: String, // Cloudinary URL
  pdfPath: String, // Keep for backward compatibility, points to pdfUrl
  qrCode: String, // Base64 QR code or URL
  emailed: {
    type: Boolean,
    default: false,
  },
  emailSentAt: Date,
  verificationToken: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
