import React from "react";
import { Box, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const ModernDarkChart = ({ invoices }) => {
  const today = new Date();

  // Last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    return { label: dayName, date: `${day}-${month}-${year}` };
  });

  // Aggregate profit per day
  const data = last7Days.map((day) => {
    const dayInvoices = invoices.filter((inv) => inv.date === day.date);
    const profit = dayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
    return { name: day.label, profit };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: "rgba(20, 20, 25, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            p: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", mb: 0.5 }}>
            {payload[0].payload.name}
          </Typography>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#10B981" }}>
            ₹{payload[0].value.toLocaleString("en-IN")}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(16, 185, 129, 0.2)", strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#profitGradient)"
            animationDuration={1500}
            dot={{
              r: 5,
              fill: "#10B981",
              stroke: "rgba(20, 20, 25, 1)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#10B981",
              stroke: "rgba(20, 20, 25, 1)",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ModernDarkChart;
