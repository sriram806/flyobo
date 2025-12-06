import mongoose from "mongoose";

const travelerSchema = new mongoose.Schema({
  fullName: String,
  age: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  passportNumber: String,
});

const paymentSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["stripe", "razorpay", "paypal", "bank_transfer", "cash", "upi", "other"],
    default: "stripe",
  },
  method: {
    type: String,
    enum: ["card", "paypal", "bank_transfer", "cash", "upi", "other"],
    default: "card",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  transactionId: String,
  orderId: String,
  paidAt: Date,
  refundId: String,
  refundDate: Date,
});

const cancellationSchema = new mongoose.Schema({
  reason: String,
  cancelledAt: Date,
  refundAmount: Number,
  cancelledBy: { type: String, enum: ["user", "admin", "system"] },
});

const bookingSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    travelers: { type: Number, required: true, min: 1 },
    travelerDetails: [travelerSchema],

    startDate: { type: Date, required: true },
    endDate: { type: Date },

    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      specialRequests: String,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
      default: "pending",
    },

    payment: paymentSchema,

    source: { type: String, enum: ["website", "mobile_app", "agent", "phone"], default: "agent" },

    totalAmount: { type: Number, default: 0 },

    cancellation: cancellationSchema,
  },
  { timestamps: true }
);

bookingSchema.pre("save", function (next) {
  let total = Number(this.payment?.amount) || 0;
  if (!isFinite(total) || isNaN(total) || total < 0) total = 0;
  this.totalAmount = total;
  next();
});

bookingSchema.index({ packageId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1 });

export default mongoose.model("Booking", bookingSchema);
