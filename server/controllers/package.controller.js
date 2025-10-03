import Package from '../models/package.model.js';
import cloudinary from 'cloudinary';
import { createPackage, getAllPackagesServices } from '../services/package.services.js';
import mongoose from 'mongoose';

// ✅ 1. CREATE A PACKAGE
export const uploadPackage = async (req, res) => {
  try {
    const data = req.body;
    let images = data.images;

    if (images && typeof images === 'string') {
      const myCloud = await cloudinary.v2.uploader.upload(images, {
        folder: "package"
      });

      data.images = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
      };
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
    const images = data.images;

    if (images) {
      await cloudinary.v2.uploader.destroy(images.public_id);

      const myCloud = await cloudinary.v2.uploader.upload(images, {
        folder: "package"
      });

      data.images = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
      };
    }

    const packageId = req.params.id;
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
