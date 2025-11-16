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

export const getAllPackagesServices = async (filters = {}) => {
  let query = {};

  // Status / featured filters
  if (filters.status) {
    query.Status = filters.status;
  }
  if (filters.featured !== undefined) {
    query.featured = filters.featured === 'true' || filters.featured === true;
  }

  // Location filter (destination or location field)
  if (filters.location) {
    query.$or = [
      { destination: { $regex: filters.location, $options: 'i' } },
      { location: { $regex: filters.location, $options: 'i' } }
    ];
  }

  // Search query: search title, destination, description
  if (filters.q) {
    const q = String(filters.q).trim();
    if (q.length > 0) {
      const regex = { $regex: q, $options: 'i' };
      query.$or = query.$or ? query.$or.concat([
        { title: regex },
        { destination: regex },
        { location: regex },
        { description: regex }
      ]) : [
        { title: regex },
        { destination: regex },
        { location: regex },
        { description: regex }
      ];
    }
  }

  // Pagination
  let page = 1;
  let limit = 0; // 0 => no limit
  if (filters.page) {
    const p = parseInt(filters.page);
    if (!isNaN(p) && p > 0) page = p;
  }
  if (filters.limit) {
    const l = parseInt(filters.limit);
    if (!isNaN(l) && l > 0) limit = l;
  }

  const baseQuery = Package.find(query).sort({ createdAt: -1 });

  // Count total matching
  const total = await Package.countDocuments(query);

  let packagesQuery = baseQuery;
  if (limit > 0) {
    const skip = (page - 1) * limit;
    packagesQuery = packagesQuery.skip(skip).limit(limit);
  }

  const packages = await packagesQuery;
  return { packages, total };
};