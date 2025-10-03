import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  payment_info: {
    type: Object
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
