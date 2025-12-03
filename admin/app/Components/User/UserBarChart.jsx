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
  size = { width: 1040, height: 240 },
}) {
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1)
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const labels = dataPoints.map((d) => formatMonth(d.month));
  const values = dataPoints.map((d) => Number(d.count || 0));

  const data = {
    labels,
    datasets: [
      {
        label: "Users",
        data: values,

        // ⭐ Gradient color
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(14,165,233,0.8)"; // fallback color while chart measures
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(14,165,233,1)");      // sky-500
          gradient.addColorStop(1, "rgba(56,189,248,0.3)");    // sky-300
          return gradient;
        },

        borderWidth: 0,
        borderRadius: 8,
        barThickness: "flex",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#e2e8f0",
        padding: 8,
        borderWidth: 0,
      },
    },

    animation: {
      duration: 900,
      easing: "easeOutQuart",
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148,163,184,0.25)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          precision: 0,
        },
      },
    },

    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div
      style={{ width: size.width, height: size.height, minWidth: 0, minHeight: Math.max(80, size.height) }}
      className="p-2"
    >
      <Bar data={data} options={options} />
    </div>
  );
}
