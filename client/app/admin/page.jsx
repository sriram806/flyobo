"use client";

import React from "react";
import AdminDashboard from "../components/Admin/AdminDashboard";
import Footer from "../components/Layout/Footer";

export default function AdminDashboardPage() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
      <AdminDashboard />
    </div>
  );
}
