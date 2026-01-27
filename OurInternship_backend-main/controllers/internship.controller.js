import Internship from "../models/Internship.model.js";
import Student from "../models/Student.js";

/**
 * CREATE INTERNSHIP
 * POST /api/internships
 */

export const createInternship = async (req, res) => {
  try {
    const internship = await Internship.create({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,

      startDate: req.body.startDate,
      endDate: req.body.endDate,
      lastDate: req.body.lastDate,

      roles: req.body.roles,
      eligibility: req.body.eligibility,

      workingHours: req.body.workingHours,
      workingDays: req.body.workingDays,

      location: req.body.location,
      workingMode: req.body.workingMode,

      charges: req.body.charges,
      benefits: req.body.benefits
    });

    res.status(201).json({
      success: true,
      message: "Internship created successfully",
      data: internship
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * GET ALL INTERNSHIPS
 * GET /api/internships
 */
export const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * GET SINGLE INTERNSHIP
 * GET /api/internships/:id
 */

export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * UPDATE INTERNSHIP
 * PUT /api/internships/:id
 */
export const updateInternship = async (req, res) => {
  try {
    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE INTERNSHIP
 * DELETE /api/internships/:id
 */
export const deleteInternship = async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.status(200).json({ message: "Internship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/internship.controller.js
export const getInternshipStatus = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // 🔹 Fetch internships that are ending or ended
    const internships = await Internship.find({
      endDate: { $lte: nextWeek }
    }).lean();

    if (!internships.length) {
      return res.json({ internships: [] });
    }

    const internshipIds = internships.map(i => i._id);

    // 🔹 Fetch students enrolled in those internships
    const students = await Student.find({
      internshipId: { $in: internshipIds }
    })
      .select("name email college internshipId")
      .lean();

    // 🔹 Attach students to internships
    const result = internships.map(internship => {
      const enrolledStudents = students.filter(
        s => String(s.internshipId) === String(internship._id)
      );

      return {
        ...internship,
        students: enrolledStudents
      };
    });

    res.json({ internships: result });
  } catch (error) {
    console.error("Internship status error:", error);
    res.status(500).json({ error: error.message });
  }
};
