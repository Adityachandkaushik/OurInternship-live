// controllers/studentController.js
import Student from "../models/Student.js";
import crypto from "crypto";
import { sendPaymentEmail } from "../utils/mailer.js";
import { generateReceiptPDF } from "../utils/generateReceiptPDF.js";
import InternshipModel from "../models/Internship.model.js";
import { autoIssueOfferLetter } from "./offerletter.controller.js";
import { mongoose } from "mongoose";


const generateApplicationId = () =>
  crypto.randomBytes(6).toString("hex").toUpperCase();

export const createStudent = async (req, res) => {
  try {
    let {
      applicationId,
      internshipId,
      category,
      name,
      contact,
      email,
      college,
      department,
      rollNumber,
      address,
      branch,
      dob,
    } = req.body;

    // ✅ REQUIRED FIELDS
    const requiredFields = [
      "internshipId",
      "name",
      "contact",
      "email",
      "college",
      "department",
      "rollNumber",
      "address",
      "branch",
      "dob",
    ];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // ✅ CHECK INTERNSHIP
    const internship = await InternshipModel.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // ✅ GENERATE APPLICATION ID
    if (!applicationId) {
      applicationId = generateApplicationId();
    }

    // ✅ PREVENT DUPLICATE APPLICATION
    const duplicate = await Student.findOne({
      email,
      internshipId,
    });

    if (duplicate) {
      return res.status(400).json({
        message: "You have already applied for this internship",
      });
    }

    // ✅ CREATE STUDENT
    const student = await Student.create({
      applicationId,
      internshipId,
      category,
      name,
      contact,
      email,
      college,
      department,
      rollNumber,
      address,
      branch,
      dob,
    });

    // ✅ LINK STUDENT TO INTERNSHIP
    internship.students.push(student._id);
    await internship.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: student,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "internshipId",
        select: "title category location workingMode startDate endDate roles"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const markPaymentPaid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { applicationId, paymentId, amount } = req.body;

    // 1️⃣ Update payment status (inside transaction)
    const student = await Student.findOneAndUpdate(
      { applicationId },
      {
        paymentStatus: "PAID",
        paymentId,
        amount,
      },
      { new: true, session }
    );

    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Populate internship
    await student.populate({
      path: "internshipId",
      session,
    });

    // 3️⃣ Generate receipt PDF
    const pdfBuffer = await generateReceiptPDF(student);

    // 4️⃣ Send payment email
    await sendPaymentEmail(student, pdfBuffer);

    // // 5️⃣ Auto issue offer letter
    // await autoIssueOfferLetter(student, session);

    // ✅ Commit ONLY if everything succeeds
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment successful , Receipt emailed",
    });

  } catch (err) {
    console.error("❌ Transaction failed:", err);

    // ❌ Rollback everything
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Payment process failed. No data was saved.",
    });
  }
};



// controllers/studentController.js
export const getStudentsByInternship = async (req, res) => {
  try {
    const students = await Student.find({
      category: req.params.category,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
