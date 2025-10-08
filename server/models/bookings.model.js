import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Booking details
  travelers: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  // Customer information
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: String
  },
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  // Payment information
  payment_info: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    method: { type: String, enum: ['card', 'paypal', 'bank_transfer', 'cash'], default: 'card' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },
  // Booking source and tracking
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'agent', 'phone'],
    default: 'website'
  },
  referralCode: String,
  discountApplied: {
    code: String,
    amount: Number,
    percentage: Number
  },
  // Additional services
  addOns: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  // Cancellation details
  cancellation: {
    reason: String,
    cancelledAt: Date,
    refundAmount: Number,
    cancelledBy: { type: String, enum: ['user', 'admin', 'system'] }
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
