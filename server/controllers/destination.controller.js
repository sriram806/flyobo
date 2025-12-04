import Destination from "../models/destinations.model.js";
import { getFileUrl, deleteFile, getFilenameFromUrl } from "../middleware/multerConfig.js";
import path from "path";

// ------------------------------
// CREATE DESTINATION
// ------------------------------
export const createDestination = async (req, res) => {
  try {
    // Accept either `place` or legacy `name` from client forms
    const rawBody = req.body || {};
    const placeValue = (rawBody.place || rawBody.name || "").toString().trim();
    const { state, country, shortDescription, tags, popular } = rawBody;

    if (!placeValue) {
      // Log incoming payload to help debug client mismatches (kept minimal)
      console.error("createDestination: missing 'place' in request", {
        bodyKeys: Object.keys(rawBody),
        file: req.file ? { fieldname: req.file.fieldname, originalname: req.file.originalname } : null,
      });
      return res.status(400).json({ success: false, message: "Place (name) is required" });
    }

    const payload = {
      place: placeValue,
      state: state || "",
      country: country || "India",
      shortDescription: shortDescription || "",
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      popular: popular === "true",
    };

    const dest = await Destination.create(payload);

    if (req.file) {
      const url = getFileUrl(req, req.file.filename, "destinations");
      dest.coverImage = { public_id: req.file.filename, url };
      await dest.save();
    }

    return res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: dest,
    });
  } catch (error) {
    console.error("createDestination error:", error);
    return res.status(500).json({ success: false, message: "Error creating destination" });
  }
};

// ------------------------------
// GET ALL DESTINATIONS
// ------------------------------
export const getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 20, q, tag, state, country, popular } = req.query;

    const baseFilters = {};
    if (tag) baseFilters.tags = tag;
    if (state) baseFilters.state = state;
    if (country) baseFilters.country = country;
    if (popular !== undefined) baseFilters.popular = popular === "true";

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    let items = [];
    let total = 0;

    // Use regex search for place, state, or country
    const searchQuery = q
      ? {
          ...baseFilters,
          $or: [
            { place: { $regex: q, $options: "i" } },
            { state: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
          ],
        }
      : baseFilters;

    [items, total] = await Promise.all([
      Destination.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Destination.countDocuments(searchQuery),
    ]);

    return res.status(200).json({
      success: true,
      data: { items, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getDestinations error:", error);
    return res.status(500).json({ success: false, message: "Error fetching destinations" });
  }
};

// ------------------------------
// GET SINGLE DESTINATION
// ------------------------------
export const getDestination = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ success: false, message: "Destination id is required" });

    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };
    const dest = await Destination.findOne(query);

    if (!dest)
      return res.status(404).json({ success: false, message: "Destination not found" });

    return res.status(200).json({ success: true, data: dest });
  } catch (error) {
    console.error("getDestination error:", error);
    return res.status(500).json({ success: false, message: "Error fetching destination" });
  }
};

// ------------------------------
// UPDATE DESTINATION
// ------------------------------
export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ success: false, message: "Destination id is required" });

    const dest = await Destination.findById(id);
    if (!dest)
      return res.status(404).json({ success: false, message: "Destination not found" });

    const payload = req.body || {};
    if (!payload.place && payload.name) payload.place = payload.name;

    if (req.file) {
      try {
        if (dest.coverImage?.url || dest.coverImage?.public_id) {
          const oldFilename = getFilenameFromUrl(dest.coverImage.url || dest.coverImage.public_id);
          if (oldFilename) {
            const oldFilePath = path.join(process.cwd(), "uploads", "destinations", oldFilename);
            deleteFile(oldFilePath);
          }
        }
      } catch {}

      const newUrl = getFileUrl(req, req.file.filename, "destinations");
      dest.coverImage = { public_id: req.file.filename, url: newUrl };
    }

    Object.assign(dest, payload);
    await dest.save();

    return res.status(200).json({ success: true, message: "Destination updated", data: dest });
  } catch (error) {
    console.error("updateDestination error:", error);
    return res.status(500).json({ success: false, message: "Error updating destination" });
  }
};

// ------------------------------
// DELETE DESTINATION
// ------------------------------
export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ success: false, message: "Destination id is required" });

    const dest = await Destination.findById(id);
    if (!dest)
      return res.status(404).json({ success: false, message: "Destination not found" });

    try {
      if (dest.coverImage?.url || dest.coverImage?.public_id) {
        const filename = getFilenameFromUrl(dest.coverImage.url || dest.coverImage.public_id);
        if (filename) {
          const filePath = path.join(process.cwd(), "uploads", "destinations", filename);
          deleteFile(filePath);
        }
      }
    } catch {}

    await dest.deleteOne();

    return res.status(200).json({ success: true, message: "Destination deleted" });
  } catch (error) {
    console.error("deleteDestination error:", error);
    return res.status(500).json({ success: false, message: "Error deleting destination" });
  }
};
