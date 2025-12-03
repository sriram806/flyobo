import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "No Subject",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

contactSchema.index({ name: "text", email: "text", subject: "text", message: "text" });

export default mongoose.model("Contact", contactSchema);
