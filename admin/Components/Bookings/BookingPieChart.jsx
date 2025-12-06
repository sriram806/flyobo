"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BookingPieChart({ paymentMethods = [], height = 350 }) {
  const pieData = {
    labels: paymentMethods.map((pm) => pm.method || "Unknown"),
    datasets: [
      {
        label: "Payment Methods",
        data: paymentMethods.map((pm) => pm.count),
        backgroundColor: [
          "#3B82F6",
          "#EF4444",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#14B8A6",
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom", labels: { color: "#9ca3af", font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const pm = paymentMethods[ctx.dataIndex];
            return `${pm.method || "Unknown"}: ${pm.count} bookings • ₹${pm.revenue ?? 0}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-300 dark:border-gray-700"
      style={{ height }}
    >
      <Pie data={pieData} options={pieOptions} />
    </div>
  );
}
