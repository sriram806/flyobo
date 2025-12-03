import { Router } from "express";
import { adminChangePassword, adminCreateUser, adminDeleteUser, adminEditUser, adminLogin, updateReferralSettings } from "../controllers/admin.controller.js";
import isAdmin from "../middleware/isAdmin.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const adminRoute = Router();
adminRoute.post("/login", adminLogin);
adminRoute.post("/create-user", isAuthenticated, isAdmin, adminCreateUser);
adminRoute.post("/change-password/:id", isAuthenticated, isAdmin, adminChangePassword);
adminRoute.post("/delete/:id", isAuthenticated, isAdmin, adminDeleteUser);
adminRoute.post("/edit-user-role/:id", isAuthenticated, isAdmin, adminEditUser);
adminRoute.put("/referral-settings", isAuthenticated,isAdmin, updateReferralSettings);

export default adminRoute;