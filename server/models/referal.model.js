import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
  },
  reward: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

referralSchema.pre('save', async function (next) {
  if (!this.code) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existingReferral = await this.constructor.findOne({ code });
      if (!existingReferral) {
        isUnique = true;
      }
    }
    this.code = code;
  }
  next();
});

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;