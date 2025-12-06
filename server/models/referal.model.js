import mongoose from "mongoose";
import crypto from "crypto";

const referralSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },

    reward: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

async function generateUniqueCode(model) {
  let code;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(4).toString("hex").toUpperCase();
    exists = await model.findOne({ code });
  }
  return code;
}

// Pre-save hook
referralSchema.pre("save", async function (next) {
  if (!this.code) {
    this.code = await generateUniqueCode(this.constructor);
  }

  // Auto-expire (if date passed)
  if (this.expiryDate < new Date() && this.status === "pending") {
    this.status = "expired";
  }

  next();
});

// Virtuals
referralSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

referralSchema.virtual("rewardInRupees").get(function () {
  return `₹${this.reward}`;
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
