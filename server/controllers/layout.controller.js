import cloudinary from "cloudinary";
import Layout from "../models/layout.model.js";

// Create Layout
export const createLayout = async (req, res) => {
    try {
        const { type } = req.body;

        if (!type) {
            return res.status(400).json({ success: false, message: "Type is required" });
        }

        let newLayout;

        if (type === "Banner") {
      // Only admin users are allowed to create banner layouts
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
      }

      const { image, title, subTitle } = req.body;
      if (!image) return res.status(400).json({ success: false, message: "Image is required" });

            const uploaded = await cloudinary.v2.uploader.upload(image, { folder: "Layout" });

            newLayout = await Layout.create({
                type: "Banner",
                image: { public_id: uploaded.public_id, url: uploaded.secure_url },
                title,
                subTitle,
            });
        }

  if (type === "FAQ") {
      // Only admin users are allowed to create FAQ layouts
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
      }

      const { faq } = req.body;
            if (!faq || !Array.isArray(faq) || faq.length === 0) {
                return res.status(400).json({ success: false, message: "FAQ items are required" });
            }

            const faqData = faq
                .map(({ question, answer }) => {
                    if (!question || !answer) return null;
                    return { question, answer };
                })
                .filter(Boolean);

            newLayout = await Layout.create({ type: "FAQ", faq: faqData });
        }

  if (type === "Category") {
            const { categories } = req.body;
            if (!categories || !Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({ success: false, message: "Categories are required" });
            }

            const categoryData = categories
                .map(({ title }) => (title ? { title } : null))
                .filter(Boolean);

            newLayout = await Layout.create({ type: "Category", categories: categoryData });
        }

        return res.status(201).json({
            success: true,
            message: "Layout created successfully",
            layout: newLayout,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get Layout
// GET /api/v1/layout?type=FAQ
export const getLayout = async (req, res) => {
    try {
        const { type } = req.query;

        let layout;

        if (type) {
            // Fetch specific layout by type
            layout = await Layout.findOne({ type }).lean();

            if (!layout) {
                return res.status(404).json({
                    success: false,
                    message: `${type} layout not found`,
                });
            }

            return res.status(200).json({
                success: true,
                message: `${type} layout fetched successfully`,
                layout,
            });
        } else {
            // Fetch all layouts
            const layouts = await Layout.find({}).lean();

            if (!layouts || layouts.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No layouts found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "All layouts fetched successfully",
                layouts,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Edit Layout
export const editLayout = async (req, res) => {
    try {
        const { type } = req.body;
        if (!type) return res.status(400).json({ success: false, message: "Type is required" });

        let updatedLayout;

    if (type === "Banner") {
      // Only admin users are allowed to edit banner layouts
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
      }

      const { image, title, subTitle } = req.body;

      const oldBanner = await Layout.findOne({ type: "Banner" });
      if (oldBanner?.image?.public_id) {
        await cloudinary.v2.uploader.destroy(oldBanner.image.public_id);
      }

      const uploaded = await cloudinary.v2.uploader.upload(image, { folder: "Layout" });

      updatedLayout = await Layout.findOneAndUpdate(
        { type: "Banner" },
        {
          type: "Banner",
          image: { public_id: uploaded.public_id, url: uploaded.secure_url },
          title,
          subTitle,
        },
        { new: true, upsert: true }
      );
    }

    if (type === "FAQ") {
      // Only admin users are allowed to edit FAQ layouts
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
      }

      const { faq } = req.body;
      if (!faq || !Array.isArray(faq)) {
        return res.status(400).json({ success: false, message: "FAQ items are required" });
      }

            const faqData = faq
                .map(({ question, answer }) => (question && answer ? { question, answer } : null))
                .filter(Boolean);

            updatedLayout = await Layout.findOneAndUpdate(
                { type: "FAQ" },
                { faq: faqData },
                { new: true, upsert: true }
            );
        }

        if (type === "Category") {
            const { categories } = req.body;
            if (!categories || !Array.isArray(categories)) {
                return res.status(400).json({ success: false, message: "Categories are required" });
            }

            const categoryData = categories
                .map(({ title }) => (title ? { title } : null))
                .filter(Boolean);

            updatedLayout = await Layout.findOneAndUpdate(
                { type: "Category" },
                { categories: categoryData },
                { new: true, upsert: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Layout updated successfully",
            layout: updatedLayout,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const deleteLayout = async (req, res) => {
  try {
    const { type, id } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Layout type is required to delete",
      });
    }

    const layout = await Layout.findOne({ type });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: `${type} layout not found`,
      });
    }

    // Banner deletion (remove Cloudinary image)
    if (type === "Banner") {
      if (layout.image?.public_id) {
        try {
          await cloudinary.v2.uploader.destroy(layout.image.public_id);
        } catch (err) {
          console.warn("Failed to delete Cloudinary image:", err.message);
        }
      }
      await Layout.deleteOne({ type });
      return res.status(200).json({
        success: true,
        message: "Banner layout deleted successfully",
      });
    }

    // FAQ deletion (delete full FAQ or single item if id provided)
    if (type === "FAQ") {
      // Only admin users are allowed to delete FAQs
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
      }

      if (id) {
        const filteredFaq = layout.faq.filter((item) => item._id.toString() !== id);
        layout.faq = filteredFaq;
        await layout.save();
        return res.status(200).json({
          success: true,
          message: "FAQ item deleted successfully",
          layout,
        });
      } else {
        await Layout.deleteOne({ type });
        return res.status(200).json({
          success: true,
          message: "All FAQ layout deleted successfully",
        });
      }
    }

    // Category deletion (delete full categories or single category by id)
    if (type === "Category") {
      if (id) {
        const filteredCategories = layout.categories.filter((item) => item._id.toString() !== id);
        layout.categories = filteredCategories;
        await layout.save();
        return res.status(200).json({
          success: true,
          message: "Category deleted successfully",
          layout,
        });
      } else {
        await Layout.deleteOne({ type });
        return res.status(200).json({
          success: true,
          message: "All Category layout deleted successfully",
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported layout type",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
