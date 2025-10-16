import Package from '../models/package.model.js';
import { createPackage, getAllPackagesServices } from '../services/package.services.js';
import { getFileUrl, deleteFile, getFilenameFromUrl } from '../middleware/multerConfig.js';
import mongoose from 'mongoose';
import path from 'path';

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

    if (req.file) {
      data.images = getFileUrl(req, req.file.filename, 'packages');
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

    // Handle image update
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }

    const foundPackage = await Package.findById(packageId)
      .populate('reviews.user', 'name');

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
      const packages = await getAllPackagesServices();
      res.status(200).json({
          success: true,
          packages
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
      });
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


