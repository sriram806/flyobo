"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

const UsersAnalyticsPage = () => {
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [monthly, setMonthly] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const fetch = async () => {
    if (!API_URL) return;
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const config = { withCredentials: true, headers: token ? { Authorization: `Bearer ${token}` } : undefined };

      const [usersRes, advRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/users`, config),
        axios.get(`${API_URL}/analytics/users/advanced`, config),
      ]);

      const usersData = usersRes?.data?.data || {};
      const adv = advRes?.data?.data || {};

      setSummary({ total: usersData.total || 0 });
      setMonthly(adv.monthlySignups || usersData.last12MonthsData || []);
      setTopUsers(adv.topUsers || []);
      setRoles(adv.roleDistribution || []);
    } catch (err) {
      console.error('Failed to load users analytics', err);
      toast.error('Failed to load users analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div className="p-6 bg-white rounded-lg">Loading users analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold">Users Analytics</h2>
        <p className="text-sm text-gray-500">Overview and department/role breakdown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Signups (last periods)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="count" stroke="#3b82f6" name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Top Users</h3>
          <div className="overflow-auto max-h-56">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Bookings</th>
                  <th className="py-2">Spent</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{u.name || u.email || 'Unknown'}</td>
                    <td className="py-2">{u.totalBookings || 0}</td>
                    <td className="py-2">{u.totalSpent ? `₹${u.totalSpent}` : '₹0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Role Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={roles} dataKey="count" nameKey="role" outerRadius={80} label>
                {roles.map((r, i) => (
                  <Cell key={i} fill={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UsersAnalyticsPage;
