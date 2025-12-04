"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ items = {}, size = 300 }) {
    const keys = Object.keys(items || {});
    let labels = [];
    let dataValues = [];

    if (keys.length === 2 && keys.includes("admin") && keys.includes("user")) {
        labels = ["Admins", "Users"];
        dataValues = [Number(items.admin || 0), Number(items.user || 0)];
    } else {
        const entries = Object.entries(items || {}).filter(([, v]) => Number(v) > 0);
        if (entries.length === 0) {
            labels = ["None"];
            dataValues = [1];
        } else {
            labels = entries.map(([k]) => k || "Unknown");
            dataValues = entries.map(([, v]) => Number(v) || 0);
        }
    }

    const total = dataValues.reduce((s, v) => s + v, 0) || 1;

    const palette = [
        "rgba(16, 185, 129, 0.9)",
        "rgba(14, 165, 233, 0.9)",
        "rgba(249, 115, 22, 0.9)",
        "rgba(168, 85, 247, 0.9)",
        "rgba(96, 165, 250, 0.9)",
        "rgba(34, 197, 94, 0.9)",
        "rgba(236, 72, 153, 0.9)",
        "rgba(244, 63, 94, 0.9)",
    ];

    const hoverPalette = palette.map((c) => c.replace(/0\.9/, "1"));

    const data = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                hoverBackgroundColor: labels.map((_, i) => hoverPalette[i % hoverPalette.length]),
                borderWidth: 2,
                borderColor: "rgba(17, 24, 39, 1)",
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#111827",
                borderColor: "#1f2937",
                borderWidth: 1,
                padding: 10,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
            },
        },
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            animateScale: true,
            animateRotate: true,
        },
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 p-4 w-full">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <Doughnut data={data} options={options} />
                <div className="absolute flex flex-col items-center text-center">
                    <p className="text-3xl md:text-4xl text-gray-900 dark:text-gray-200 font-bold">{total}</p>
                    <p className="text-xs md:text-sm text-gray-400">Total</p>
                </div>
            </div>

            <div className="flex-1 space-y-3 w-full max-w-xs">
                {labels.map((lbl, idx) => {
                    const val = dataValues[idx] || 0;
                    const perc = ((val / total) * 100).toFixed(1);
                    return (
                        <div key={lbl} className="flex items-center gap-3">
                            <span
                                style={{ backgroundColor: palette[idx % palette.length] }}
                                className="w-4 h-4 rounded-full shadow inline-block"
                            />
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{lbl}</p>
                                <p className="text-xs text-gray-400">{val} • {perc}%</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
