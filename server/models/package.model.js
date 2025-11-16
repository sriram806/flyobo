import mongoose from 'mongoose';

function parseReviewDate(val) {
  if (!val) return val;
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val);
  if (typeof val === 'string') {
    const native = new Date(val);
    if (!isNaN(native.getTime())) return native;

    const m = val.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (m) {
      const d = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10);
      const y = parseInt(m[3], 10);
      if (y > 1900 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        return new Date(y, mo - 1, d);
      }
    }
  }
  return val;
}

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number,
  },
  duration: {
    type: Number,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  Status:{
    type: String,
    enum: ['active', 'draft'],
    default: 'active',
  },
  featured:{
    type:Boolean,
    default: false
  },
  images: {
    type: String,
    default: ""
  },
  tags: {
    type: String
  },
  itinerary: [{
    day: Number,
    description: String,
    activities: [String]
  }],
  included: [String],
  excluded: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now,
      set: parseReviewDate
    }
  }],
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;