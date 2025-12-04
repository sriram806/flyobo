"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DestinationPieChart({ domestic, international }) {
  const data = [
    { name: "Domestic", value: domestic },
    { name: "International", value: international },
  ];

  const COLORS = ["#6366F1", "#10B981"]; // Indigo + Emerald

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-lg">
        Destination Type Ratio
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="50%"
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "var(--tw-prose-bg, #fff)",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
            labelStyle={{ fontWeight: "600" }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: "10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
