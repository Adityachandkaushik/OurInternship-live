import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByInternship
} from "../controllers/studentController.js";
import { markPaymentPaid } from "../controllers/studentController.js";

const router = express.Router();

// Routes
router.post("/", createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/payment-success", markPaymentPaid);
// routes/student.js
router.get(
  "/internship/:category",
  getStudentsByInternship
);


export default router;
