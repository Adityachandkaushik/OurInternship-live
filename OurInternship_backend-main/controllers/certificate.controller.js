// controllers/certificate.controller.js
import Student from "../models/Student.js";
import { Certificate } from "../models/certificate.model.js";
import { generateCertificate, generateQRCode } from "../utils/generateCertificate.js";
import { sendCertificateMail } from "../utils/sendMail.js";
import { uploadCertificateToCloudinary} from "../utils/cloudinary.js";
import crypto from "crypto";
import axios from "axios";


/**
 * Generate and issue certificate
 */
export const generateAndIssueCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;  
    const { startDate, endDate } = req.body;

    // ✅ Populate ONLY internship
    const student = await Student.findById(studentId).populate(
      "internshipId",
      "title location workingMode startDate endDate roles"
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Prevent duplicate
    const existingCert = await Certificate.findOne({ studentId, emailed: true });
    if (existingCert) {
      return res.status(400).json({ error: "Certificate already issued" });
    }

    const internship = student.internshipId;
    if (!internship) {
      return res.status(400).json({ error: "Internship not assigned" });
    }

    // ✅ Resolve dates
    const resolvedStartDate = startDate || internship.startDate;
    const resolvedEndDate = endDate || internship.endDate;

    if (!resolvedStartDate || !resolvedEndDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    const certificateId = `CERT-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-certificate/${certificateId}?token=${verificationToken}`;

    // ✅ Generate PDF
    const localPdfPath = await generateCertificate(
      {
        name: student.name,
        category: student.category,
        applicationId: student.applicationId,
        internshipTitle: internship.title,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
      },
      certificateId,
      verificationUrl
    );

    const pdfUrl = await uploadCertificateToCloudinary(localPdfPath, certificateId);
    const qrCode = await generateQRCode(verificationUrl);

    // ✅ Store snapshot (NO future populate dependency)
    const certificate = await Certificate.create({
      studentId: student._id,
      internshipId: internship._id,
      certificateId,
      certificateNumber: certificateId,
      studentName: student.name,
      email: student.email,
      category: student.category,
      internshipTitle: internship.title,
      internshipRole: internship.roles?.[0] || "",
      internshipLocation: internship.location,
      internshipMode: internship.workingMode,
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
      pdfUrl,
      qrCode,
      verificationToken,
      issuedDate: new Date(),
    });

    student.certificateIssued = true;
    student.certificateId = certificate._id;
    student.certificateUrl = pdfUrl;
    await student.save();

    // ✅ Email
    await sendCertificateMail(
      student.email,
      pdfUrl,
      student.name,
      certificateId,
      verificationUrl
    );

    certificate.emailed = true;
    certificate.emailSentAt = new Date();
    await certificate.save();

    res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      certificateId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * VERIFY CERTIFICATE
 * GET /api/certificates/verify/:certificateId?token=xxx
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { token } = req.query;

    const certificate = await Certificate.findOne({ certificateId })
      .populate({
        path: "studentId",
        select: "name email college",
      })
      .populate({
        path: "internshipId",
        select: "title category role location mode startDate endDate",
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found",
      });
    }

    // 🔐 Token check (QR verification)
    if (token && certificate.verificationToken !== token) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired verification token",
      });
    }

    // 🔢 Increase verification count
    certificate.verificationCount += 1;
    certificate.isVerified = true;
    await certificate.save();

    res.status(200).json({
      success: true,
      isValid: true,

      certificate: {
        certificateId: certificate.certificateId,
        issuedDate: certificate.issuedDate,
        verificationCount: certificate.verificationCount,
        pdfUrl: certificate.pdfUrl || certificate.pdfPath,

        // 🎓 Student Info
        studentName: certificate.studentId?.name,
        email: certificate.studentId?.email,
        college: certificate.studentId?.college,

        // 💼 Internship Info
        internshipTitle: certificate.internshipId?.title,
        internshipCategory: certificate.internshipId?.category,
        internshipRole: certificate.internshipId?.role,
        internshipLocation: certificate.internshipId?.location,
        internshipMode: certificate.internshipId?.mode,
        startDate: certificate.internshipId?.startDate,
        endDate: certificate.internshipId?.endDate,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while verifying certificate",
    });
  }
};


/**
 * Get certificate download link / Proxy Cloudinary PDF
 * GET /api/certificates/download/:certificateId
 */
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate?.pdfUrl) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    certificate.verificationCount += 1;
    await certificate.save();

    const fetch = (await import("node-fetch")).default;

    // ✅ Fetch from Cloudinary RAW public URL
    const pdfRes = await fetch(certificate.pdfUrl);
    if (!pdfRes.ok) {
      throw new Error(`Cloudinary fetch failed: ${pdfRes.status}`);
    }

    const buffer = await pdfRes.buffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${certificateId}.pdf"`
    );
    res.send(buffer);
  } catch (err) {
    console.error("Download error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


/**
 * Resend certificate email
 * POST /api/certificates/resend/:certificateId
 */
export const resendCertificateEmail = async (req, res) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne(
    { certificateId },
    "email pdfUrl studentName verificationToken"
  );

  if (!certificate) {
    return res.status(404).json({ error: "Certificate not found" });
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}?token=${certificate.verificationToken}`;

  await sendCertificateMail(
    certificate.email,
    certificate.pdfUrl,
    certificate.studentName,
    certificateId,
    verificationUrl
  );

  certificate.emailSentAt = new Date();
  await certificate.save();

  res.json({ success: true });
};


/**
 * Get all certificates (admin only)
 * GET /api/certificates
 */
export const getAllCertificates = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const certificates = await Certificate.find()
    .populate("studentId", "name email")
    .populate("internshipId", "title")
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  res.json({ success: true, certificates });
};

/**
 * Get certificate details by ID
 * GET /api/certificates/:certificateId
 */
export const getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId }).populate(
      "studentId",
      "name email college department"
    ).populate("internshipId");

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({
      success: true,
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        email: certificate.email,
        category: certificate.category,
        internshipTitle: certificate.internshipTitle,
        internshipRole: certificate.internshipRole,
        internshipLocation: certificate.internshipLocation,
        internshipMode: certificate.internshipMode,
        startDate: certificate.startDate,
        endDate: certificate.endDate,
        issuedDate: certificate.issuedDate,
        emailed: certificate.emailed,
        emailSentAt: certificate.emailSentAt,
        verificationCount: certificate.verificationCount,
        student: certificate.studentId,
        internship: certificate.internshipId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all certificates for a student
 * GET /api/certificates/student/:studentId
 */
export const getStudentCertificates = async (req, res) => {
  try {
    const { studentId } = req.params;

    const certificates = await Certificate.find({ studentId })
      .populate("internshipId")
      .sort({ createdAt: -1 });

    if (certificates.length === 0) {
      return res.status(404).json({ error: "No certificates found for this student" });
    }

    res.json({
      success: true,
      count: certificates.length,
      certificates: certificates.map((cert) => ({
        id: cert._id,
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        category: cert.category,
        internshipTitle: cert.internshipTitle,
        internshipRole: cert.internshipRole,
        issuedDate: cert.issuedDate,
        emailed: cert.emailed,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET CERTIFICATE DETAILS (for preview)
 * GET /api/certificates/:certificateId
 */
export const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("studentId", "name email college")
      .populate("internshipId", "title category role location mode startDate endDate");

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.status(200).json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        pdfUrl: certificate.pdfUrl || certificate.pdfPath,
        issuedDate: certificate.issuedDate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const previewCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne(
      { certificateId },
      "pdfUrl"
    );

    if (!certificate?.pdfUrl) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const pdfResponse = await axios.get(certificate.pdfUrl, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    pdfResponse.data.pipe(res);
  } catch (error) {
    console.error("Preview error:", error.message);
    res.status(500).json({ error: "Preview failed" });
  }
};
