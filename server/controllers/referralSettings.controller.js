import ReferralSettings from "../models/referralSettings.model.js";

export const getReferralSettings = async (req, res) => {
  try {
    let settings = await ReferralSettings.findOne();
    if (!settings) {
      settings = await ReferralSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referral settings",
      error: error.message,
    });
  }
};

export const updateReferralSettings = async (req, res) => {
  try {
    const {
      enabled,
      referralBonus,
      signupBonus,
      minRedeemAmount,
      maxRedeemAmount,
      currency,
    } = req.body;

    // Update settings (there will always be 1 document)
    const settings = await ReferralSettings.findOneAndUpdate(
      {},
      {
        enabled,
        referralBonus,
        signupBonus,
        minRedeemAmount,
        maxRedeemAmount,
        currency,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Referral settings updated successfully",
      settings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update referral settings",
      error: error.message,
    });
  }
};
