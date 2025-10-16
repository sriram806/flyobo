import express from 'express';
import { uploadGalleryImage } from '../middleware/multerConfig.js';
import { getFileUrl } from '../middleware/multerConfig.js';
import fs from 'fs';
import path from 'path';

const uploadRouter = express.Router();

// Test upload endpoint
uploadRouter.post('/test', uploadGalleryImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const fileUrl = getFileUrl(req, req.file.filename, 'gallery');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed',
      error: error.message 
    });
  }
});

// Get uploaded files list
uploadRouter.get('/files/:folder', (req, res) => {
  try {
    const folder = req.params.folder;
    const uploadsDir = path.join(process.cwd(), 'uploads', folder);

    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Folder not found' 
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const fileList = files.map(filename => ({
      filename,
      url: getFileUrl(req, filename, folder),
      path: path.join(uploadsDir, filename)
    }));

    res.status(200).json({
      success: true,
      folder,
      files: fileList,
      count: fileList.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list files',
      error: error.message 
    });
  }
});

export default uploadRouter;