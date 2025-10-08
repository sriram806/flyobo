import catchAsyncErrors from "./catchAsyncErrors.js";

const isAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req?.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if ((req.user.role || "user") !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal error in admin check" });
  }
});

export default isAdmin;
