import Wishlist from "../models/wishlist.model.js";
import Package from "../models/package.model.js";
import User from "../models/user.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Add item to wishlist
export const addToWishlist = catchAsyncErrors(async (req, res) => {
  try {
    const { packageId, notes, priority } = req.body;
    const userId = req.user._id;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required"
      });
    }

    // Check if package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, packageId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Package is already in your wishlist"
      });
    }

    // Create wishlist item
    const wishlistItem = await Wishlist.create({
      userId,
      packageId,
      notes: notes || '',
      priority: priority || 'medium'
    });

    // Update user wishlist count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.wishlistCount': 1 }
    });

    // Populate package details
    const populatedItem = await Wishlist.findById(wishlistItem._id)
      .populate('packageId', 'title description price estimatedPrice duration destination images')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: "Package added to wishlist successfully",
      data: populatedItem
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add package to wishlist"
    });
  }
});

// Remove item from wishlist
export const removeFromWishlist = catchAsyncErrors(async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = req.user._id;

    const deletedItem = await Wishlist.findOneAndDelete({ userId, packageId });
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist"
      });
    }

    // Update user wishlist count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.wishlistCount': -1 }
    });

    res.status(200).json({
      success: true,
      message: "Package removed from wishlist successfully"
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove package from wishlist"
    });
  }
});

// Get user's wishlist
export const getUserWishlist = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, priority, sortBy = 'addedAt' } = req.query;

    const skip = (page - 1) * limit;
    let query = { userId };

    // Filter by priority if specified
    if (priority) {
      query.priority = priority;
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'addedAt':
        sortOptions = { addedAt: -1 };
        break;
      case 'priority':
        sortOptions = { priority: 1, addedAt: -1 };
        break;
      case 'price':
        sortOptions = { 'packageId.price': 1 };
        break;
      default:
        sortOptions = { addedAt: -1 };
    }

    const wishlistItems = await Wishlist.find(query)
      .populate({
        path: 'packageId',
        select: 'title description price estimatedPrice duration destination images Status',
        match: { Status: 'active' } // Only show active packages
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out items where package was not found (deleted or inactive)
    const validItems = wishlistItems.filter(item => item.packageId);

    const total = await Wishlist.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        wishlist: validItems,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: validItems.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
});

// Update wishlist item (notes, priority)
export const updateWishlistItem = catchAsyncErrors(async (req, res) => {
  try {
    const { packageId } = req.params;
    const { notes, priority } = req.body;
    const userId = req.user._id;

    const updatedItem = await Wishlist.findOneAndUpdate(
      { userId, packageId },
      { 
        ...(notes !== undefined && { notes }),
        ...(priority !== undefined && { priority })
      },
      { new: true }
    ).populate('packageId', 'title description price estimatedPrice duration destination images');

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist"
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.error("Update wishlist item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist item"
    });
  }
});

// Check if package is in wishlist
export const checkWishlistStatus = catchAsyncErrors(async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = req.user._id;

    const exists = await Wishlist.findOne({ userId, packageId });

    res.status(200).json({
      success: true,
      data: {
        inWishlist: !!exists,
        wishlistItem: exists
      }
    });
  } catch (error) {
    console.error("Check wishlist status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status"
    });
  }
});

// Get wishlist analytics for admin
export const getWishlistAnalytics = catchAsyncErrors(async (req, res) => {
  try {
    // Most wished packages
    const mostWishedPackages = await Wishlist.aggregate([
      {
        $group: {
          _id: '$packageId',
          count: { $sum: 1 },
          averagePriority: { $avg: { $cond: [
            { $eq: ['$priority', 'high'] }, 3,
            { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }
          ]}},
          latestAddedAt: { $max: '$addedAt' }
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'package'
        }
      },
      {
        $unwind: '$package'
      },
      {
        $project: {
          packageId: '$_id',
          packageTitle: '$package.title',
          packagePrice: '$package.price',
          packageDestination: '$package.destination',
          wishlistCount: '$count',
          averagePriority: '$averagePriority',
          latestAddedAt: '$latestAddedAt'
        }
      },
      {
        $sort: { wishlistCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Wishlist trends over time
    const wishlistTrends = await Wishlist.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$addedAt' },
            month: { $month: '$addedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    // Priority distribution
    const priorityDistribution = await Wishlist.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total statistics
    const totalWishlistItems = await Wishlist.countDocuments();
    const uniqueUsers = await Wishlist.distinct('userId').then(users => users.length);
    const uniquePackages = await Wishlist.distinct('packageId').then(packages => packages.length);

    res.status(200).json({
      success: true,
      data: {
        mostWishedPackages,
        wishlistTrends,
        priorityDistribution,
        summary: {
          totalWishlistItems,
          uniqueUsers,
          uniquePackages,
          averageItemsPerUser: uniqueUsers > 0 ? (totalWishlistItems / uniqueUsers).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error("Get wishlist analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist analytics"
    });
  }
});