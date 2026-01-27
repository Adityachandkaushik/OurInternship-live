import express from "express";
import { reissueOfferLetter, verifyOfferLetter } from "../controllers/offerletter.controller.js";

const router = express.Router();

// Admin & Student
router.post("/reissue/:id", reissueOfferLetter);
// router.get("/verify/:applicationId", verifyOfferLetter);


export default router;
