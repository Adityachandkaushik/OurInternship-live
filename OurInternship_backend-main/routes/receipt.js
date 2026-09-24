import express from "express";
import { downloadReceipt } from "../controllers/receiptController.js";

const router = express.Router();
   
router.get("/:applicationId", downloadReceipt);

export default router;
