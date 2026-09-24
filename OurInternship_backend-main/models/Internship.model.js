import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {   
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    lastDate: { type: Date, required: true },

    roles: [{ type: String }], // HR, Marketing, Social Media

    eligibility: { type: String },

    workingHours: { type: String }, // 11:00 AM - 5:00 PM
    workingDays: { type: String }, // Monday to Friday
students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    location: { type: String },
    workingMode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"]
    },

    charges: { type: String },

    benefits: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Internship", internshipSchema);
