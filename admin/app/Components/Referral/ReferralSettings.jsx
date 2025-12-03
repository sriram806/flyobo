"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ReferralSettings() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [settings, setSettings] = useState({
    enabled: false,
    referralBonus: 0,
    signupBonus: 0,
    minRedeemAmount: 0,
    maxRedeemAmount: 0,
    currency: "INR",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_URL}/referral/referral-settings`, {
          withCredentials: true,
        });
        if (res?.data?.settings) {
          setSettings((s) => ({ ...s, ...res.data.settings }));
        }
      } catch (e) {
        toast.error("Failed to load referral settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API_URL]);

  function updateField(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  const validate = () => {
    if (Number(settings.minRedeemAmount) < 0) return "Min redeem must be >= 0";
    if (Number(settings.maxRedeemAmount) <= 0) return "Max redeem must be > 0";
    if (Number(settings.maxRedeemAmount) < Number(settings.minRedeemAmount))
      return "Max redeem must be >= min redeem";
    return null;
  };

  const saveSettings = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      const payload = {
        enabled: Boolean(settings.enabled),
        referralBonus: Number(settings.referralBonus) || 0,
        signupBonus: Number(settings.signupBonus) || 0,
        minRedeemAmount: Number(settings.minRedeemAmount) || 0,
        maxRedeemAmount: Number(settings.maxRedeemAmount) || 0,
        currency: settings.currency,
      };

      const res = await axios.put(`${API_URL}/admin/referral-settings`, payload, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        toast.success("Referral settings updated!");
        setSettings((s) => ({ ...s, ...res.data.settings }));
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-t-sky-500 border-gray-300 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Referral Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">
            Configure your referral program. All changes apply globally.
          </p>
        </div>

        {/* STATUS + TOGGLE */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div
            className={`px-4 py-1 rounded-full font-semibold text-sm shadow-sm ${
              settings.enabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {settings.enabled ? "ENABLED" : "DISABLED"}
          </div>

          <div className="flex items-center bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 gap-4 transition hover:shadow-xl">
            <button
              type="button"
              onClick={async () => {
                // optimistic toggle
                if (toggling) return;
                const newVal = !settings.enabled;
                updateField("enabled", newVal);
                setToggling(true);
                try {
                  await axios.put(`${API_URL}/admin/referral-settings`, { enabled: newVal }, { withCredentials: true });
                  toast.success(`Referral ${newVal ? 'enabled' : 'disabled'}`);
                } catch (e) {
                  // revert on failure
                  updateField("enabled", !newVal);
                  console.error(e);
                  toast.error('Failed to update referral status');
                } finally {
                  setToggling(false);
                }
              }}
              disabled={toggling}
              aria-pressed={settings.enabled}
              className={`h-12 w-12 flex items-center justify-center rounded-full text-white transition ${
                settings.enabled ? "bg-emerald-500 hover:bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
              } ${toggling ? 'opacity-70 cursor-wait' : ''}`}
            >
              {toggling ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : settings.enabled ? (
                "✓"
              ) : (
                "⚑"
              )}
            </button>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Referral Program</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {settings.enabled
                  ? "Active — users can earn & redeem rewards"
                  : "Inactive — referral rewards are paused"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SettingCard
          label="Referral Bonus"
          value={settings.referralBonus}
          currency={settings.currency}
          onChange={(v) => updateField("referralBonus", v)}
        />
        <SettingCard
          label="Signup Bonus"
          value={settings.signupBonus}
          currency={settings.currency}
          onChange={(v) => updateField("signupBonus", v)}
        />
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition border">
          <label className="text-sm text-gray-600 dark:text-gray-400">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => updateField("currency", e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option>INR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>AED</option>
          </select>
        </div>
      </div>

      {/* MIN/MAX REDEEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputCard
          label="Minimum Redeem Amount"
          value={settings.minRedeemAmount}
          onChange={(v) => updateField("minRedeemAmount", v)}
        />
        <InputCard
          label="Maximum Redeem Amount"
          value={settings.maxRedeemAmount}
          onChange={(v) => updateField("maxRedeemAmount", v)}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={saving}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-lg transition"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <ConfirmationModal onCancel={() => setConfirmOpen(false)} onConfirm={saveSettings} />
      )}
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function SettingCard({ label, value, currency, onChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition border">
      <label className="text-sm text-gray-600 dark:text-gray-400">{label}</label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <span className="text-gray-500 dark:text-gray-400">{currency}</span>
      </div>
    </div>
  );
}

function InputCard({ label, value, onChange }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition border">
      <label className="text-sm text-gray-600 dark:text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

function InfoCard({ label, value, mono }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition border">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 font-medium ${mono ? "font-mono break-all text-sm" : ""}`}>
        {value ? new Date(value).toLocaleString() : "—"}
      </p>
    </div>
  );
}

function ConfirmationModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transition-transform transform scale-100">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Changes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          You are about to update the referral system settings. These changes will affect all users. 
          <br />Are you sure you want to continue?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}
