import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ModernSalesChart = ({ invoices }) => {
  const today = new Date();

  // Last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return { label: `${day}-${month}`, date: `${day}-${month}-${year}` };
  });

  // Aggregate revenue & profit per day
  const data = last7Days.map((day) => {
    const dayInvoices = invoices.filter((inv) => inv.date === day.date);
    const revenue = dayInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const profit = dayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
    return { name: day.label, revenue, profit };
  });

  return (
    <Paper
      elevation={8}
      sx={{
        borderRadius: 4,
        p: 4,
        mb: 4,
        background: "#ffffff",
        boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          mb: 3,
          color: "#1e1b2e",
        }}
      >
        Revenue vs Profit (Last 7 Days)
      </Typography>

      <Box sx={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27ae60" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007bff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#007bff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e6e8f0" />
            <XAxis dataKey="name" tick={{ fill: "#4a4769", fontSize: 13 }} />
            <YAxis tick={{ fill: "#4a4769", fontSize: 13 }} />
            <Tooltip
              formatter={(value, name) => [`₹${value.toLocaleString("en-IN")}`, name]}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "1px solid #ded2f7",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#27ae60"
              strokeWidth={3}
              dot={{ r: 6, fill: "#27ae60", stroke: "#27ae60", strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              fill="url(#colorRevenue)"
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#007bff"
              strokeWidth={3}
              dot={{ r: 6, fill: "#007bff", stroke: "#007bff", strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              fill="url(#colorProfit)"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ModernSalesChart;