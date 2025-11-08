"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NEXT_PUBLIC_BACKEND_URL } from '@/app/config/env';
import { toast } from 'react-hot-toast';

export default function ReferralSettingsPage() {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: true,
    referralBonus: 100,
    signupBonus: 50,
    minRedeemAmount: 50,
    maxRedeemAmount: 10000,
    currency: 'INR'
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/referral-admin/settings`, { withCredentials: true });
        if (cancelled) return;
        if (data?.data) setForm((f) => ({ ...f, ...data.data }));
      } catch (err) {
        console.error('Load settings error', err);
        toast.error('Failed to load referral settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [API_URL]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : (name.includes('Amount') || name.includes('Bonus') ? Number(value) : value) }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      const { data } = await axios.put(`${API_URL}/referral-admin/settings`, payload, { withCredentials: true });
      if (data?.success) {
        toast.success('Referral settings updated');
        setForm((f) => ({ ...f, ...data.data }));
      } else {
        toast.error(data?.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error', err);
      toast.error('Failed to save referral settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Referral Program Settings</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="enabled" checked={form.enabled} onChange={onChange} className="h-4 w-4" />
          <span>Referral program enabled</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Referral Bonus (referrer)</label>
            <input type="number" name="referralBonus" value={form.referralBonus} onChange={onChange} className="mt-1 w-full p-2 rounded border" />
          </div>
          <div>
            <label className="text-sm">Signup Bonus (new user)</label>
            <input type="number" name="signupBonus" value={form.signupBonus} onChange={onChange} className="mt-1 w-full p-2 rounded border" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Min Redeem Amount</label>
            <input type="number" name="minRedeemAmount" value={form.minRedeemAmount} onChange={onChange} className="mt-1 w-full p-2 rounded border" />
          </div>
          <div>
            <label className="text-sm">Max Redeem Amount</label>
            <input type="number" name="maxRedeemAmount" value={form.maxRedeemAmount} onChange={onChange} className="mt-1 w-full p-2 rounded border" />
          </div>
        </div>

        <div>
          <label className="text-sm">Currency</label>
          <input type="text" name="currency" value={form.currency} onChange={onChange} className="mt-1 w-40 p-2 rounded border" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">{saving ? 'Saving...' : 'Save Settings'}</button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border rounded">Reload</button>
        </div>
      </div>
    </div>
  );
}
