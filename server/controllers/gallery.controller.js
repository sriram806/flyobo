import Gallery from '../models/gallery.model.js';

export const getGalleryItems = async (req, res) => {
  try {
    const { category, tag } = req.query;
    let query = {};

    if (category) query.category = category;
    if (tag) query.tags = tag;

    const items = await Gallery.find(query)
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const likeIndex = item.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      item.likes.push(req.user._id);
    } else {
      item.likes.splice(likeIndex, 1);
    }

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (
      item.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.remove();
    res.json({ message: 'Gallery item removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
