import express from "express";
import { handleContact } from "../controllers/contact.controller.js";

const router = express.Router();

// Public contact endpoint
router.post("/", handleContact);

export default router;
