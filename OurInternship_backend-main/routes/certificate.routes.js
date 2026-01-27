// routes/certificate.routes.js
import express from "express";
import {
  generateAndIssueCertificate,
  verifyCertificate,
  getCertificateDetails,
  getStudentCertificates,
  downloadCertificate,
  getAllCertificates,
  resendCertificateEmail,
} from "../controllers/certificate.controller.js";
import { getCertificateById } from "../controllers/certificate.controller.js";
import { previewCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

// 🔓 Public
router.get("/:certificateId/download", downloadCertificate);
router.get("/:certificateId/preview", previewCertificate);
router.get("/verify/:certificateId", verifyCertificate);
router.get("/:certificateId", getCertificateById);
// Provide both /:id and /:id/details for backwards compatibility
router.get("/:certificateId", getCertificateDetails);
router.get("/:certificateId/details", getCertificateDetails);

// 🎓 Student
router.get("/student/:studentId", getStudentCertificates);

// 🔐 Admin
router.post("/generate/:studentId", generateAndIssueCertificate);
router.get("/", getAllCertificates);
router.post("/:certificateId/resend", resendCertificateEmail);

export default router;
