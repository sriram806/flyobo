"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Settings,
  Save,
  RefreshCw,
  DollarSign,
  Percent,
  Users,
  Clock,
  Mail,
  Bell,
  Shield,
  Edit,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const AdminReferralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    programEnabled: true,
    programName: "FlyObo Referral Program",
    programDescription: "Earn rewards by referring friends to FlyObo",
    
    // Reward Settings
    baseReferralReward: 100,
    refereeSignupBonus: 50,
    minimumPayoutAmount: 500,
    payoutProcessingDays: 3,
    
    // Tier Settings
    tierSystem: {
      enabled: true,
      tiers: [
        { name: 'Bronze', minReferrals: 0, bonusMultiplier: 1.0, color: '#CD7F32' },
        { name: 'Silver', minReferrals: 10, bonusMultiplier: 1.2, color: '#C0C0C0' },
        { name: 'Gold', minReferrals: 25, bonusMultiplier: 1.5, color: '#FFD700' },
        { name: 'Diamond', minReferrals: 50, bonusMultiplier: 2.0, color: '#B9F2FF' }
      ]
    },
    
    // Commission Settings
    commissionRates: {
      level1: 10, // Direct referrals
      level2: 5,  // Sub-referrals
      level3: 2   // Sub-sub-referrals
    },
    
    // Conversion Requirements
    conversionRequirements: {
      emailVerification: true,
      firstPurchase: false,
      accountAgeMinDays: 0,
      minimumPurchaseAmount: 0
    },
    
    // Notification Settings
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true
    },
    
    // Link Settings
    linkSettings: {
      linkExpiration: 30, // days
      customDomainEnabled: false,
      customDomain: '',
      trackingEnabled: true,
      utmTracking: true
    },
    
    // Fraud Prevention
    fraudPrevention: {
      ipTracking: true,
      deviceFingerprinting: true,
      selfReferralPrevention: true,
      maxReferralsPerDay: 10,
      suspiciousActivityDetection: true
    },
    
    // Terms & Conditions
    termsAndConditions: {
      enabled: true,
      content: "Terms and conditions for the referral program...",
      version: "1.0",
      lastUpdated: new Date().toISOString()
    }
  });

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      // const response = await axios.get(`${API_URL}/admin/referral-settings`);
      // setSettings(response.data.settings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // Mock API call - replace with actual implementation
      // await axios.put(`${API_URL}/admin/referral-settings`, { settings });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...settings.tierSystem.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setSettings({
      ...settings,
      tierSystem: {
        ...settings.tierSystem,
        tiers: newTiers
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure your referral program settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Enable Referral Program</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Turn the entire referral program on or off</p>
            </div>
            <button
              onClick={() => updateSetting('programEnabled', !settings.programEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.programEnabled ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.programEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Name
              </label>
              <input
                type="text"
                value={settings.programName}
                onChange={(e) => updateSetting('programName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Program Description
            </label>
            <textarea
              value={settings.programDescription}
              onChange={(e) => updateSetting('programDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Reward Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Reward Settings
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base Referral Reward (₹)
              </label>
              <input
                type="number"
                value={settings.baseReferralReward}
                onChange={(e) => updateSetting('baseReferralReward', parseFloat(e.target.value))}
                min="0"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referee Signup Bonus (₹)
              </label>
              <input
                type="number"
                value={settings.refereeSignupBonus}
                onChange={(e) => updateSetting('refereeSignupBonus', parseFloat(e.target.value))}
                min="0"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min. Payout Amount (₹)
              </label>
              <input
                type="number"
                value={settings.minimumPayoutAmount}
                onChange={(e) => updateSetting('minimumPayoutAmount', parseFloat(e.target.value))}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payout Processing (Days)
              </label>
              <input
                type="number"
                value={settings.payoutProcessingDays}
                onChange={(e) => updateSetting('payoutProcessingDays', parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tier System */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tier System
            </h3>
            <button
              onClick={() => updateSetting('tierSystem.enabled', !settings.tierSystem.enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.tierSystem.enabled ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.tierSystem.enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
        {settings.tierSystem.enabled && (
          <div className="p-6">
            <div className="space-y-4">
              {settings.tierSystem.tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tier Name
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min. Referrals
                    </label>
                    <input
                      type="number"
                      value={tier.minReferrals}
                      onChange={(e) => updateTier(index, 'minReferrals', parseInt(e.target.value))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bonus Multiplier
                    </label>
                    <input
                      type="number"
                      value={tier.bonusMultiplier}
                      onChange={(e) => updateTier(index, 'bonusMultiplier', parseFloat(e.target.value))}
                      min="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={tier.color}
                      onChange={(e) => updateTier(index, 'color', e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Commission Rates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Rates
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level 1 (Direct) %
              </label>
              <input
                type="number"
                value={settings.commissionRates.level1}
                onChange={(e) => updateSetting('commissionRates.level1', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level 2 (Sub-referral) %
              </label>
              <input
                type="number"
                value={settings.commissionRates.level2}
                onChange={(e) => updateSetting('commissionRates.level2', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level 3 (Sub-sub-referral) %
              </label>
              <input
                type="number"
                value={settings.commissionRates.level3}
                onChange={(e) => updateSetting('commissionRates.level3', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <button
                onClick={() => updateSetting(`notifications.${key}`, !value)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  value ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fraud Prevention */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fraud Prevention
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Object.entries(settings.fraudPrevention).filter(([key]) => typeof settings.fraudPrevention[key] === 'boolean').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                  <button
                    onClick={() => updateSetting(`fraudPrevention.${key}`, !value)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      value ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Referrals Per Day
              </label>
              <input
                type="number"
                value={settings.fraudPrevention.maxReferralsPerDay}
                onChange={(e) => updateSetting('fraudPrevention.maxReferralsPerDay', parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralSettings;