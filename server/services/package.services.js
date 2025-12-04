import Package from "../models/package.model.js";
import Destination from "../models/destinations.model.js";
import mongoose from 'mongoose';

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
  // Normalize destination: allow passing destination as name/slug or ObjectId
  try {
    if (data?.destination) {
      // If already a valid ObjectId, leave it
      if (typeof data.destination === 'string' && mongoose.Types.ObjectId.isValid(data.destination)) {
        // ok
      } else if (typeof data.destination === 'string') {
        const raw = data.destination.trim();
        // try find by slug
        let dest = await Destination.findOne({ slug: raw.toLowerCase() });
        if (!dest) {
          // try exact place match (case-insensitive)
          dest = await Destination.findOne({ place: { $regex: `^${raw}$`, $options: 'i' } });
        }
        if (dest) data.destination = dest._id;
        else {
          return res.status(400).json({ success: false, message: 'Destination not found. Provide a valid Destination _id, slug, or exact place name.' });
        }
      }
    }

    // Normalize images: accept string (CSV or JSON), object, or array
    let imgs = data?.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) {
        imgs = imgs.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (imgs && !Array.isArray(imgs)) {
      if (typeof imgs === 'object') imgs = [imgs];
      else imgs = [];
    }
    imgs = (imgs || []).map(i => {
      if (typeof i === 'string') return { public_id: null, url: i };
      if (i && typeof i === 'object') return { public_id: i.public_id || null, url: i.url || i.path || i.filename || null };
      return null;
    }).filter(Boolean);
    data.images = imgs;

    // Ensure `slug` is present and unique. If client didn't provide, derive from title.
    const makeSlug = (s) => {
      return String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    if (!data.slug && data.title) {
      let base = makeSlug(data.title);
      if (!base) base = `pkg-${Date.now()}`;
      let candidate = base;
      let suffix = 0;
      // find unique slug
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // if no package found with candidate slug, use it
        // Note: small race condition possible but acceptable for admin flows
        // because duplicates are rare; handle duplicate-key error fallback below.
        // Use lean query for performance
        // eslint-disable-next-line no-await-in-loop
        const exists = await Package.findOne({ slug: candidate }).lean();
        if (!exists) break;
        suffix += 1;
        candidate = `${base}-${suffix}`;
      }
      data.slug = candidate;
    }

    let packages;
    try {
      packages = await Package.create(data);
    } catch (createErr) {
      // Handle duplicate key error on slug gracefully by retrying once with a unique suffix
      if (createErr && createErr.code === 11000 && createErr.keyPattern && createErr.keyPattern.slug) {
        const base = makeSlug(data.title || `pkg-${Date.now()}`);
        const alt = `${base}-${Date.now()}`;
        data.slug = alt;
        packages = await Package.create(data);
      } else {
        throw createErr;
      }
    }
    res.status(201).json({
      success: true,
      message: `Package Created Successfully`,
      package: packages,
    });
    return;
  } catch (err) {
    console.error('createPackage error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Error creating package', error: err.message });
    }
    return;
  }
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