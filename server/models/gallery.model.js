import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters long"],
        },
        image: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "nature",
                "group",
                "city",
                "adventure",
                "wildlife",
                "culture",
                "beach",
                "heritage",
                "other",
            ],
            required: [true, "Category is required"],
            lowercase: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
            set: (tags) => tags.map((tag) => tag.toLowerCase().trim()),
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader reference is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;
