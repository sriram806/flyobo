import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
  getGalleryItems,
  uploadGalleryItem,
  toggleLike,
  deleteGalleryItem,
} from '../controllers/gallery.controller.js';

const router = express.Router();

// Public: list gallery
router.get('/', getGalleryItems);

// Auth: create item
router.post('/', isAuthenticated, uploadGalleryItem);

// Auth: like/unlike
router.patch('/:id/like', isAuthenticated, toggleLike);

// Auth: delete item
router.delete('/:id', isAuthenticated, deleteGalleryItem);

export default router;
