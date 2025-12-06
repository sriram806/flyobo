"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BookingBarChart({ dataPoints = [], height = 350 }) {
  const labels = dataPoints.map((d) => d.monthLabel || "-");
  const values = dataPoints.map((d) => Number(d.count || 0));

  const data = {
    labels,
    datasets: [
      {
        label: "Bookings",
        data: values,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(59,130,246,0.8)";
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(59,130,246,1)");
          gradient.addColorStop(1, "rgba(147,197,253,0.3)");
          return gradient;
        },
        borderRadius: 12,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        ticks: { color: "#9ca3af" },
        beginAtZero: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const growthRate =
    dataPoints.length >= 2
      ? (
          ((values[values.length - 1] - values[values.length - 2]) /
            (values[values.length - 2] || 1)) *
          100
        ).toFixed(2)
      : null;

  const positive = growthRate >= 0;

  return (
    <div
      className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-300 dark:border-gray-700"
      style={{ height }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 h-full">
        <div className="lg:col-span-5 h-full">
          <Bar data={data} options={options} />
        </div>

        <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-2xl flex flex-col justify-center p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Booking Growth
          </h3>

          <div
            className={`text-3xl font-bold ${
              positive ? "text-green-500" : "text-red-500"
            }`}
          >
            {growthRate !== null ? `${growthRate}% ${positive ? "↑" : "↓"}` : "—"}
          </div>

          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            Change from last month
          </p>

          {growthRate !== null && (
            <div className="w-full mt-4 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  positive ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(Math.abs(growthRate), 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
