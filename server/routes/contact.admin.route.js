import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import { listContacts, getContact, deleteContact, markAsRead } from "../controllers/contact.admin.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, isAdmin, listContacts);
router.get("/:id", isAuthenticated, isAdmin, getContact);
router.put("/:id/read", isAuthenticated, isAdmin, markAsRead);
router.delete("/:id", isAuthenticated, isAdmin, deleteContact);

export default router;
