import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const heroSchema = new mongoose.Schema(
  {
    images: {
      type: [
        {
          public_id: { type: String },
          url: { type: String },
        },
      ],
      default: () => [
        { public_id: "1", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" },
        { public_id: "2", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" },
        { public_id: "3", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" },
      ],
      validate: {
        validator: arr => Array.isArray(arr) && arr.length === 3,
        message: "Hero.images must contain exactly 3 images",
      },
    },

    destinations: {
      type: [
        {
          name: { type: String, required: true },
          slug: { type: String },
          description: { type: String },
        },
      ],
      default: () => [
        { name: "Destination 1", slug: "destination-1", description: "" },
        { name: "Destination 2", slug: "destination-2", description: "" },
        { name: "Destination 3", slug: "destination-3", description: "" },
        { name: "Destination 4", slug: "destination-4", description: "" },
        { name: "Destination 5", slug: "destination-5", description: "" },
      ],
      validate: {
        validator: arr => Array.isArray(arr) && arr.length === 5,
        message: "Hero.destinations must contain exactly 5 destinations",
      },
    },
  },
  { timestamps: true }
);

heroSchema.pre("validate", function (next) {
  if (this.destinations) {
    this.destinations = this.destinations.map(d => ({
      ...d,
      slug:
        d.slug ||
        d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }
  next();
});

// -----------------------------
// MAIN LAYOUT SCHEMA
// -----------------------------
const layoutSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    faq: [faqSchema],
    hero: heroSchema,
  },
  { timestamps: true }
);

const Layout = mongoose.model("Layout", layoutSchema);

export default Layout;