import Gallery from "../models/gallery.model.js";
import { getFileUrl, deleteFile, getFilenameFromUrl } from '../middleware/multerConfig.js';


export const getGalleryItems = async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    const query = {};

    if (category) query.category = category.toLowerCase();
    if (tag) query.tags = { $in: [tag.toLowerCase()] };
    if (search) query.title = { $regex: search, $options: "i" };

    const items = await Gallery.find(query).populate("uploadedBy", "name email").sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch gallery items", error: error.message });
  }
};

export const uploadGalleryItem = async (req, res) => {
  try {
    const { imageUrl: providedUrl, tags } = req.body;

    // Accept either an uploaded file or an existing image URL
    if (!req.file && !providedUrl) {
      return res.status(400).json({ message: "Please provide an image file or an imageUrl" });
    }

    // Get image URL (string, not object)
    let imageUrl = null;
    if (req.file) {
      imageUrl = getFileUrl(req, req.file.filename, 'gallery');
    } else if (providedUrl) {
      imageUrl = providedUrl.trim();
    }

    // Parse tags from comma-separated string to array
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    const galleryItem = new Gallery({
      title: req.body.title,
      image: imageUrl,
      category: req.body.category,
      tags: tagsArray,
      uploadedBy: req.user._id,
    });

    const savedItem = await galleryItem.save();
    await savedItem.populate("uploadedBy", "name email");
    
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: "Failed to upload gallery item", error: error.message });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    if (
      galleryItem.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    Object.keys(updates).forEach((key) => {
      galleryItem[key] = updates[key];
    });

    const updatedItem = await galleryItem.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Failed to update gallery item", error: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    if (
      item.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.status(200).json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete gallery item", error: error.message });
  }
};
