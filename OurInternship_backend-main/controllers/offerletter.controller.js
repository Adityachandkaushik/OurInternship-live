import { generateOfferLetterPDF } from "../utils/generateOfferLetterPDF.js";
// import { sendOfferLetterEmail } from "../services/email.service.js";
import Student from "../models/Student.js";
import { sendOfferLetterEmail } from "../utils/sendOfferLetterEmail.js";
import { deleteFromCloudinaryByUrl } from "../utils/cloudinary.js";


export const verifyOfferLetter = async (req, res) => {
  const student = await Student.findOne({
    applicationId: req.params.applicationId,
    offerLetterIssued: true,
  });

  if (!student) {
    return res.status(404).send("Invalid Offer Letter");
  }

  res.json({
    status: "VALID",
    name: student.name,
    internship: student.internshipId?.title,
    issuedOn: student.offerLetterIssuedAt,
  });
};

// 🔹 AUTO ISSUE (Payment Success)
export const autoIssueOfferLetter = async (studentId, session) => {
  // 1️⃣ Fetch student INSIDE transaction
  const student = await Student.findById(studentId)
    .populate("internshipId")
    .session(session);

  if (!student || student.offerLetterIssued) return;

  // 2️⃣ Generate Offer Letter PDF (external IO – OK)
  const offerLetterUrl = await generateOfferLetterPDF(student);

  // 3️⃣ Update DB fields (transaction safe)
  student.offerLetterIssued = true;
  student.offerLetterIssuedAt = new Date();
  student.offerLetterUrl = offerLetterUrl;

  await student.save({ session });

  // 4️⃣ Send email OUTSIDE transaction (IMPORTANT)
  try {
    await sendOfferLetterEmail(student);
  } catch (emailErr) {
    console.error("❌ Offer letter email failed:", emailErr);
    // Email failure should NOT rollback payment/offer
  }
};


export const reissueOfferLetter = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("internshipId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Payment not completed" });
    }
  /* 🔥 DELETE OLD OFFER LETTER (IF EXISTS) */
    // if (student.offerLetterUrl) {
    //   await deleteFromCloudinaryByUrl(student.offerLetterUrl);
    // }
    const pdfUrl = await generateOfferLetterPDF(student);

    student.offerLetterIssued = true;
    student.offerLetterUrl = pdfUrl;
    student.offerLetterIssuedAt = new Date();
    await student.save();
    await sendOfferLetterEmail(student);
    res.json({
      success: true,
      offerLetterUrl: pdfUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Offer letter reissue failed" });
  }
};



