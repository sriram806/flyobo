import Package from '../models/package.model.js';
import { createPackage, getAllPackagesServices } from '../services/package.services.js';
import { getFileUrl, deleteFile, getFilenameFromUrl } from '../middleware/multerConfig.js';
import mongoose from 'mongoose';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

// simple slug generator: lowercase, replace non-alphanum with hyphens, collapse hyphens
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// ✅ 1. CREATE A PACKAGE
export const uploadPackage = async (req, res) => {
  try {
    const data = req.body;

    // Parse JSON fields that come as strings from FormData
    if (data.itinerary && typeof data.itinerary === 'string') {
      try {
        data.itinerary = JSON.parse(data.itinerary);
      } catch (e) {
        data.itinerary = [];
      }
    }
    
    if (data.included && typeof data.included === 'string') {
      try {
        data.included = JSON.parse(data.included);
      } catch (e) {
        data.included = [];
      }
    }
    
    if (data.excluded && typeof data.excluded === 'string') {
      try {
        data.excluded = JSON.parse(data.excluded);
      } catch (e) {
        data.excluded = [];
      }
    }

    // Handle boolean fields
    if (data.featured !== undefined) {
      data.featured = data.featured === 'true' || data.featured === true;
    }

    // Handle image - either file upload OR imageUrl
    if (req.file) {
      data.images = getFileUrl(req, req.file.filename, 'packages');
    } else if (data.imageUrl && data.imageUrl.trim()) {
      data.images = data.imageUrl.trim();
    }

    // generate slug from title if not provided
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    createPackage(data, res, req);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ 2. UPDATE PACKAGE
export const EditPackage = async (req, res) => {
  try {
    const data = req.body;
    const packageId = req.params.id;

    // Parse JSON fields that come as strings from FormData
    if (data.itinerary && typeof data.itinerary === 'string') {
      try {
        data.itinerary = JSON.parse(data.itinerary);
      } catch (e) {
        data.itinerary = [];
      }
    }
    
    if (data.included && typeof data.included === 'string') {
      try {
        data.included = JSON.parse(data.included);
      } catch (e) {
        data.included = [];
      }
    }
    
    if (data.excluded && typeof data.excluded === 'string') {
      try {
        data.excluded = JSON.parse(data.excluded);
      } catch (e) {
        data.excluded = [];
      }
    }

    // Handle boolean fields
    if (data.featured !== undefined) {
      data.featured = data.featured === 'true' || data.featured === true;
    }

    // Handle image update - either file upload OR imageUrl
    if (req.file) {
      // Get existing package to delete old image
      const existingPackage = await Package.findById(packageId);
      if (existingPackage && existingPackage.images) {
        const oldFilename = getFilenameFromUrl(existingPackage.images);
        if (oldFilename) {
          const oldFilePath = path.join(process.cwd(), 'uploads', 'packages', oldFilename);
          deleteFile(oldFilePath);
        }
      }

      // Upload new image
      data.images = getFileUrl(req, req.file.filename, 'packages');
    } else if (data.imageUrl && data.imageUrl.trim()) {
      data.images = data.imageUrl.trim();
    }

    // update slug when title changes
    if (data.title) {
      data.slug = slugify(data.title);
    }
    const UpdatedPackage = await Package.findByIdAndUpdate(
      packageId,
      { $set: data },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Package is Updated Successfully',
      UpdatedPackage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. GET SINGLE PACKAGE
export const getSinglePackage = async (req, res) => {
  try {
    const packageId = req.params.id;

    let foundPackage = null;

    // If it's a valid ObjectId, try by id first
    if (mongoose.Types.ObjectId.isValid(packageId)) {
      foundPackage = await Package.findById(packageId).populate('reviews.user', 'name');
    }

    // If not found by id, or the param wasn't an ObjectId, try by slug or title
    if (!foundPackage) {
      const maybeSlug = decodeURIComponent(packageId).toString().toLowerCase();
      foundPackage = await Package.findOne({ slug: maybeSlug }).populate('reviews.user', 'name');
      if (!foundPackage) {
        // fallback: try exact title match
        foundPackage = await Package.findOne({ title: decodeURIComponent(packageId) }).populate('reviews.user', 'name');
      }
    }

    if (!foundPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({
      success: true,
      foundPackage
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPackages = async (req, res) => {
  try {
      // Pass query parameters to the service
      const result = await getAllPackagesServices(req.query);
      // result: { packages, total }
      res.status(200).json({
          success: true,
          packages: result.packages,
          total: result.total
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
};

// GET distinct locations/destinations for filter dropdowns
export const getPackageLocations = async (req, res) => {
  try {
    // Find distinct values from destination and location fields
    const dests = await Package.distinct('destination');
    const locs = await Package.distinct('location');
    // Merge, dedupe and filter empty values
    const merged = Array.from(new Set([...(dests || []), ...(locs || [])].map(s => (s || '').toString().trim()).filter(Boolean)));
    res.status(200).json({ success: true, locations: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ 5. ADD REVIEW TO PACKAGE
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const foundPackage = await Package.findById(req.params.id);

    if (!foundPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    foundPackage.reviews.push(review);
    foundPackage.rating =
      foundPackage.reviews.reduce((acc, item) => item.rating + acc, 0) /
      foundPackage.reviews.length;

    await foundPackage.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ 6. GET PACKAGES BY USER ID
export const getPackagebyUser = async (req, res) => {
  try {
    const userPackagesList = req.user.packages;
    const packageId = req.params.id;

    const packageExists = userPackagesList.find(
      (pkg) => pkg._id.toString() === packageId
    );

    if (!packageExists) {
      return res.status(400).json({
        success: false,
        message: "Package not found in user's package list"
      });
    }

    const pkg = await Package.findById(packageId);
    const content = pkg.packageData;

    res.status(200).json({
      success: true,
      content
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ 8. DELETE PACKAGE
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);

    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: "Package not found"
      });
    }

    await pkg.deleteOne();

    res.status(200).json({
      success: true,
      message: "Package Deleted Successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 9. BULK UPLOAD PACKAGES FROM EXCEL
export const bulkUploadPackages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file provided' });
    }

    const filePath = req.file.path;
    
    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (!data || data.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }

    const results = {
      success: [],
      failed: [],
      total: data.length
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map Excel columns to package fields (case-insensitive)
        const packageData = {
          title: row.title || row.Title || row.TITLE || '',
          description: row.description || row.Description || row.DESCRIPTION || '',
          price: Number(row.price || row.Price || row.PRICE || 0),
          estimatedPrice: Number(row.estimatedPrice || row['Estimated Price'] || row.ESTIMATEDPRICE || 0),
          duration: Number(row.duration || row.Duration || row.DURATION || 0),
          destination: row.destination || row.Destination || row.DESTINATION || '',
          status: (row.status || row.Status || row.STATUS || 'active').toLowerCase(),
          featured: Boolean(row.featured || row.Featured || row.FEATURED),
          images: row.imageUrl || row.imageurl || row['Image URL'] || row.IMAGEURL || '',
        };

        // Parse arrays if provided
        if (row.tags || row.Tags) {
          const tagsStr = String(row.tags || row.Tags || '');
          packageData.tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean).join(',');
        }

        if (row.included || row.Included) {
          const incStr = String(row.included || row.Included || '');
          packageData.included = incStr.split(',').map(t => t.trim()).filter(Boolean);
        }

        if (row.excluded || row.Excluded) {
          const excStr = String(row.excluded || row.Excluded || '');
          packageData.excluded = excStr.split(',').map(t => t.trim()).filter(Boolean);
        }

        // Validate required fields
        if (!packageData.title || !packageData.price || !packageData.duration || !packageData.destination) {
          results.failed.push({
            row: i + 2, // Excel row (1-indexed + header)
            data: row,
            error: 'Missing required fields (title, price, duration, destination)'
          });
          continue;
        }

        // Create package
        // generate slug
        packageData.slug = slugify(packageData.title);
        const newPackage = await Package.create(packageData);
        results.success.push({
          row: i + 2,
          packageId: newPackage._id,
          title: newPackage.title
        });

      } catch (error) {
        results.failed.push({
          row: i + 2,
          data: row,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      success: true,
      message: `Bulk upload completed. ${results.success.length} packages created, ${results.failed.length} failed.`,
      results
    });

  } catch (error) {
    // Clean up file if exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};