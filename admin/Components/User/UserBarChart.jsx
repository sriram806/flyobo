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

export default function UserBarChart({
  dataPoints = [],
  size = { width: "100%", height: 280 },
}) {
  const labels = dataPoints.map((d) => d.label);
  const values = dataPoints.map((d) => Number(d.count || 0));

  const data = {
    labels,
    datasets: [
      {
        label: "Users Growth",
        data: values,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(14,165,233,0.8)";
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(14,165,233,1)");
          gradient.addColorStop(1, "rgba(56,189,248,0.3)");
          return gradient;
        },
        borderRadius: 10,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          color: "#6b7280",
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6b7280",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Calculate growth rate
  const growthRate =
    dataPoints.length >= 2
      ? (((values[values.length - 1] - values[values.length - 2]) /
          (values[values.length - 2] || 1)) *
          100
        ).toFixed(2)
      : null;

  // Determine arrow and color
  const isPositive = growthRate >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

      {/* LEFT — CHART */}
      <div
        className="bg-gray-200 dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-300 dark:border-gray-700 lg:col-span-3"
        style={{ height: size.height }}
      >
        <Bar data={data} options={options} />
      </div>

      {/* RIGHT — GROWTH RATE */}
      <div className="bg-gray-900 dark:from-gray-900 dark:to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Growth Rate
        </h3>

        <div
          className={`flex items-center justify-center text-3xl font-bold ${
            isPositive ? "text-green-600" : "text-red-500"
          }`}
        >
          {growthRate !== null ? (
            <>
              {growthRate}% {isPositive ? "↑" : "↓"}
            </>
          ) : (
            "—"
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 text-center">
          Change from previous period
        </p>

        {growthRate !== null && (
          <div className="w-full mt-4 h-3 bg-gray-300 dark:bg-gray-900 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full ${
                isPositive ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${Math.min(Math.abs(growthRate), 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
