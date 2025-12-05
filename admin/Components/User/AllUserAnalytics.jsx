"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import PieChart from "./PieChart";
import UserBarChart from "./UserBarChart";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import Loading from "../Loading/Loading";

export default function AllUserAnalytics() {
  const base = NEXT_PUBLIC_BACKEND_URL;

  const [analytics, setAnalytics] = useState(null);
  const [latestUsers, setLatestUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setAnalyticsLoading(true);
      try {
        const { data } = await axios.get(`${base}/reports/users`, {
          withCredentials: true,
        });
        setAnalytics(data?.data || null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
  }, [base]);

  useEffect(() => {
    async function loadCookie() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${base}/admin/debug-cookies`, {
          withCredentials: true,
        });;
        console.log(data);
        
      } catch (err) {
        console.error("Error fetching users:", err);
        setLatestUsers([]);
      } finally {
        setLoading(false);
      }
    }
    loadCookie();
  }, [base]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${base}/user/get-all-users`, {
          withCredentials: true,
        });

        const sorted = (data?.users || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestUsers(sorted.slice(0, 4));
      } catch (err) {
        console.error("Error fetching users:", err);
        setLatestUsers([]);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [base]);

  if (!analytics) return <div><Loading /></div>;

  const { totalUsers, roles, monthlyUsers, topBookingUsers } = analytics;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: totalUsers },
          { label: "Admins", value: roles.admin },
          { label: "Managers", value: roles.manager },
          { label: "Customers", value: roles.user },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700"
          >
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 flex justify-center">
          <PieChart
            items={{
              admin: roles.admin,
              manager: roles.manager,
              user: roles.user,
            }}
            size={240}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top Booking Users
          </h3>
          <ul className="divide-y dark:divide-gray-700">
            {topBookingUsers.map((u) => (
              <li key={u._id} className="p-3 flex justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {u.name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">{u.email || "No Email"}</div>
                </div>
                <span className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700">
                  ₹{u.totalSpent} / {u.bookingsCount} bookings
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Monthly User Growth
          </h3>

          {analyticsLoading ? (
            <div>Loading...</div>
          ) : (
            <UserBarChart
              dataPoints={monthlyUsers.map((m) => ({
                label: m.monthLabel,
                count: m.count,
              }))}
              summary={{
                totalUsers: totalUsers,
                manager: roles.manager,
                user: roles.user,
              }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Latest Users
          </h3>
          <ul className="divide-y dark:divide-gray-700">
            {latestUsers.map((u) => (
              <li key={u._id} className="p-3 flex justify-between">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <span className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
