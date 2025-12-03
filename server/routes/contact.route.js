import express from "express";
import {
  handleContact,
  listContacts,
  getContact,
  deleteContact,
  markAsRead
} from "../controllers/contact.controller.js";
import { updateStatus } from "../controllers/contact.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/", handleContact);
router.get("/", isAuthenticated, isAdmin, listContacts);
router.get("/:id", isAuthenticated, isAdmin, getContact);
router.put("/:id/read", isAuthenticated, isAdmin, markAsRead);
router.patch("/:id/status", isAuthenticated, isAdmin, updateStatus);
router.delete("/:id", isAuthenticated, isAdmin, deleteContact);

export default router;
