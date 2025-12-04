"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DestinationLineChart({ data }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            dataKey="month"
            tick={{ fill: "var(--tw-prose-gray, #6b7280)" }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--tw-prose-gray, #6b7280)" }}
          />

          <Tooltip
            contentStyle={{
              background: "var(--tw-prose-bg, #fff)",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
            labelStyle={{ fontWeight: "600" }}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
