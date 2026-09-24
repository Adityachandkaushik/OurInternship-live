import express from "express";
import { login, logout, register } from "../controllers/userController.js";

const router = express.Router();

/* ================= AUTH ROUTES ================= */

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);  

// Get logged-in user profile
// router.get("/profile", isAuthenticated, p);

export default router;
