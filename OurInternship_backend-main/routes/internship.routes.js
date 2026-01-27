import express from "express";
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getInternshipStatus
} from "../controllers/internship.controller.js";
import InternshipModel from "../models/Internship.model.js";

const router = express.Router();

// Admin & Student
router.post("/", createInternship);
router.get("/", getAllInternships);
router.get("/status", getInternshipStatus);
router.get("/:id", getInternshipById);

// Admin only
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);
router.get("/", async (req, res) => {
  const internships = await InternshipModel.find();
  res.status(200).json(internships);
});

export default router;
