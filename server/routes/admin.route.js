import { Router } from "express";
import { adminChangePassword, adminCreateUser, adminDeleteUser, adminEditUser, adminLogin, updateReferralSettings } from "../controllers/admin.controller.js";
import isAdmin from "../middleware/isAdmin.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const adminRoute = Router();
adminRoute.post("/login", adminLogin);
// Temporary debug route: returns request headers and cookies for troubleshooting
// NOTE: remove this route after debugging — it may expose sensitive headers
adminRoute.get("/debug-cookies", (req, res) => {
	try {
		return res.status(200).json({ success: true, cookies: req.cookies || {}, headers: req.headers || {} });
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Debug endpoint error', error: err.message });
	}
});
adminRoute.post("/create-user", isAuthenticated, isAdmin, adminCreateUser);
adminRoute.post("/change-password/:id", isAuthenticated, isAdmin, adminChangePassword);
adminRoute.post("/delete/:id", isAuthenticated, isAdmin, adminDeleteUser);
adminRoute.post("/edit-user-role/:id", isAuthenticated, isAdmin, adminEditUser);
adminRoute.put("/referral-settings", isAuthenticated,isAdmin, updateReferralSettings);

export default adminRoute;