import Gallery from "../models/gallery.model.js";

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
    const galleryItem = new Gallery({
      ...req.body,
      uploadedBy: req.user._id,
    });

    const savedItem = await galleryItem.save();
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
