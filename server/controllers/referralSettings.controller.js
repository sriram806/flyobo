import ReferralSettings from '../models/referralSettings.model.js';

// Helper to get or create default settings
const getOrCreateSettings = async () => {
  let settings = await ReferralSettings.findOne({}).lean();
  if (!settings) {
    const created = await ReferralSettings.create({});
    settings = created.toObject();
  }
  return settings;
};

export const getReferralSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get referral settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateReferralSettings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const { enabled, referralBonus, signupBonus, minRedeemAmount, maxRedeemAmount, currency } = req.body;

    let settings = await ReferralSettings.findOne({});
    if (!settings) settings = new ReferralSettings({});

    if (typeof enabled === 'boolean') settings.enabled = enabled;
    if (typeof referralBonus === 'number') settings.referralBonus = referralBonus;
    if (typeof signupBonus === 'number') settings.signupBonus = signupBonus;
    if (typeof minRedeemAmount === 'number') settings.minRedeemAmount = minRedeemAmount;
    if (typeof maxRedeemAmount === 'number') settings.maxRedeemAmount = maxRedeemAmount;
    if (typeof currency === 'string') settings.currency = currency;

    settings.updatedAt = new Date();
    await settings.save();

    return res.status(200).json({ success: true, message: 'Referral settings updated', data: settings });
  } catch (error) {
    console.error('Update referral settings error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
