import Package from "../models/package.model.js";

// Try to parse various string date formats, return Date or null
function parseFlexibleDate(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input !== "string") return null;
  const m = input.match(/^\s*(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\s*$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1; // zero-based
    const y = Number(m[3]);
    const dt = new Date(Date.UTC(y, mo, d));
    return isNaN(dt.getTime()) ? null : dt;
  }
  // Fallback to Date constructor for ISO-like strings
  const dt = new Date(input);
  return isNaN(dt.getTime()) ? null : dt;
}

export const createPackage = async (data, res, req) => {
  if (Array.isArray(data?.reviews)) {
    data.reviews = data.reviews.map((r) => {
      const copy = { ...r };
      const parsed = parseFlexibleDate(r?.date);
      if (parsed) {
        copy.date = parsed;
      } else {
        delete copy.date;
      }
      return copy;
    });
  }

  const packages = await Package.create(data);
  res.status(201).json({
    success: true,
    message: `Package Created Successfully`,
    package: packages,
  });
};

export const getAllPackagesServices = async () => {
    const packages = await Package.find().sort({ createdAt: -1 });
    return packages;
};