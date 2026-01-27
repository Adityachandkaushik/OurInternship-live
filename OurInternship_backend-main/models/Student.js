import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
    },
    offerLetterIssued: {
      type: Boolean,
      default: false,
    },
    offerLetterIssuedAt: {
      type: Date,
    },
    offerLetterUrl: {
      type: String, // PDF URL or file path
    },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    college: { type: String, required: true },
    department: { type: String, required: true },
    rollNumber: { type: String, required: true },
    branch: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String, required: true },

    // 🔗 INTERNSHIP
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },

    // 💳 PAYMENT
    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },
    paymentId: String,
    amount: Number,
    applicationPaymentDate: Date,

    // 📜 CERTIFICATE
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: String,
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Student", studentSchema);
