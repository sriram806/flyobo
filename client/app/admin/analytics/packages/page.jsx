"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PackagesAnalyticsPage = () => {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [topPackages, setTopPackages] = useState([]);
  const [priceBuckets, setPriceBuckets] = useState([]);
  const [byDestination, setByDestination] = useState([]);

  const fetch = async () => {
    if (!API_URL) return;
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const config = { withCredentials: true, headers: token ? { Authorization: `Bearer ${token}` } : undefined };

      const [advRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/packages/advanced`, config),
      ]);

      const adv = advRes?.data?.data || {};
      setTopPackages(adv.topByBookings || []);
      setPriceBuckets(adv.priceBuckets || []);
      setByDestination(adv.byDestination || []);
    } catch (err) {
      console.error('Failed to load packages analytics', err);
      toast.error('Failed to load packages analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="p-6 bg-white rounded-lg">Loading packages analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold">Packages Analytics</h2>
        <p className="text-sm text-gray-500">Top packages, price buckets and destination popularity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Top Packages by Bookings</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Package</th>
                  <th className="py-2">Bookings</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPackages.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{p.packageName}</td>
                    <td className="py-2">{p.bookings}</td>
                    <td className="py-2">₹{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Price Buckets</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priceBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Top Destinations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byDestination}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PackagesAnalyticsPage;
