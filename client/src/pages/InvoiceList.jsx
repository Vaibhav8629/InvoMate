import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, TextField, Button,
  InputAdornment, Avatar, Skeleton, Tooltip, LinearProgress,
  useTheme,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ icon, label, onClick, active = false }) => {
  const theme = useTheme();
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box
        onClick={onClick}
        sx={{
          width: 44, height: 44, borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          background: active ? theme.palette.primary.light : "transparent",
          transition: "all 0.18s ease",
          "&:hover": { background: theme.palette.primary.light, color: theme.palette.primary.main },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, bg, iconColor, trend }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: "16px", p: "20px",
      background: theme.palette.background.paper,
      display: "flex", flexDirection: "column", gap: "12px",
      transition: "all 0.20s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 24px rgba(15,28,46,0.10)",
        borderColor: theme.palette.primary.light,
      },
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: "12px",
          background: bg, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </Box>
        {trend !== undefined && (
          <Box sx={{
            display: "flex", alignItems: "center", gap: "4px",
            background: theme.palette.success.light,
            color: theme.palette.success.dark,
            borderRadius: "8px", px: "8px", py: "3px",
          }}>
            <ArrowUpwardRoundedIcon sx={{ fontSize: 12 }} />
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700 }}>{trend}</Typography>
          </Box>
        )}
      </Box>
      <Box>
        <Typography sx={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "1.6rem", fontWeight: 800,
          color: theme.palette.text.primary, lineHeight: 1.2,
        }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, mt: "4px" }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── Custom Tooltip for chart ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: theme.palette.text.primary,
      borderRadius: "10px", px: "14px", py: "10px",
      boxShadow: "0 8px 24px rgba(15,28,46,0.18)",
    }}>
      <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", mb: "2px" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
        {payload[0].value} units
      </Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Invoices() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [invoices, setInvoices]               = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch]                   = useState("");
  const [loading, setLoading]                 = useState(true);

  const fetchInvoices = async () => {
    const res   = await fetch("http://localhost:5000/api/auth/getinvoices", {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setInvoices(data);
    setFilteredInvoices(data);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleSearch = (value) => {
    const text = String(value || "");
    setSearch(text);
    if (text.trim() === "") { fetchInvoices(); return; }
    const q = text.toLowerCase();
    setFilteredInvoices(invoices.filter((inv) =>
      inv.invoiceNumber?.toString().toLowerCase().includes(q) ||
      inv.customerName?.toLowerCase().includes(q) ||
      inv.phone?.toString().includes(q) ||
      inv.items?.some((item) => item.item?.toLowerCase().includes(q))
    ));
  };

  const getProductSales = () => {
    const salesMap = {};
    filteredInvoices.forEach((invoice) => {
      if (!invoice.items) return;
      invoice.items.forEach((item) => {
        if (!salesMap[item.item]) salesMap[item.item] = 0;
        salesMap[item.item] += Number(item.qty);
      });
    });
    return Object.entries(salesMap)
      .map(([product, sales]) => ({ product, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  };

  const chartData     = getProductSales();
  const totalRevenue  = filteredInvoices.reduce((a, b) => a + Number(b.total  || 0), 0);
  const totalProfit   = filteredInvoices.reduce((a, b) => a + Number(b.profit || 0), 0);

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      display: "flex", minHeight: "100vh",
      background: theme.palette.background.default,
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <Box sx={{
        width: 72, flexShrink: 0,
        background: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", py: "24px", gap: "8px",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <Box
          onClick={() => navigate("/home")}
          sx={{
            width: 40, height: 40, borderRadius: "12px",
            background: theme.palette.primary.main,
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: "16px", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(27,110,243,0.35)",
          }}
        >
          <GridViewRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>

        <NavItem icon={<GridViewRoundedIcon fontSize="small" />}     label="Dashboard"   onClick={() => navigate("/dashboard")} />
        <NavItem icon={<AddCircleOutlineIcon fontSize="small" />}    label="New Invoice" onClick={() => navigate("/createbill")} />
        <NavItem icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Invoices"    onClick={() => navigate("/invoices")} active />
        <NavItem icon={<Inventory2OutlinedIcon fontSize="small" />}  label="Products"    onClick={() => navigate("/products")} />
        <NavItem icon={<StorefrontOutlinedIcon fontSize="small" />}  label="Profile"     onClick={() => navigate("/profile")} />

        <Box sx={{ mt: "auto" }}>
          <NavItem icon={<LogoutIcon fontSize="small" />} label="Logout" onClick={handleLogout} />
        </Box>
      </Box>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, p: "32px", overflow: "auto" }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "28px" }}>
          <Box>
            <Typography sx={{
              fontSize: "1.5rem", fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: theme.palette.text.primary, lineHeight: 1.2,
            }}>
              Invoice Manager
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: "4px", fontWeight: 500 }}>
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""} found
            </Typography>
          </Box>

          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate("/createbill")}
            variant="contained"
            sx={{
              textTransform: "none", fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "20px",
              background: theme.palette.primary.main,
              boxShadow: "0 4px 14px rgba(27,110,243,0.35)",
              "&:hover": { background: theme.palette.primary.dark, boxShadow: "0 6px 20px rgba(27,110,243,0.45)" },
            }}
          >
            New Invoice
          </Button>
        </Box>

        {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px", p: "16px",
          background: theme.palette.background.paper,
          mb: "24px",
          display: "flex", gap: "12px", alignItems: "center",
        }}>
          <TextField
            fullWidth
            placeholder="Search by invoice no., customer name, phone or product..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem", borderRadius: "10px",
                background: theme.palette.background.default,
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "1.5px" },
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => handleSearch(search)}
            sx={{
              textTransform: "none", fontWeight: 600, whiteSpace: "nowrap",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "10px", px: "20px", flexShrink: 0,
              background: theme.palette.primary.main,
              boxShadow: "0 4px 12px rgba(27,110,243,0.28)",
              "&:hover": { background: theme.palette.primary.dark },
            }}
          >
            Search
          </Button>
        </Paper>

        {/* ── STAT CARDS ──────────────────────────────────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", mb: "24px" }}>
          <StatCard
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            label="Total Invoices"
            value={loading ? "—" : filteredInvoices.length}
            bg={theme.palette.primary.light}
            iconColor={theme.palette.primary.main}
          />
          <StatCard
            icon={<CurrencyRupeeIcon fontSize="small" />}
            label="Total Revenue"
            value={loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`}
            bg={theme.palette.success.light}
            iconColor={theme.palette.success.main}
            trend="All time"
          />
          <StatCard
            icon={<TrendingUpIcon fontSize="small" />}
            label="Total Profit"
            value={loading ? "—" : `₹${totalProfit.toLocaleString("en-IN")}`}
            bg={theme.palette.info.light}
            iconColor={theme.palette.info.main}
            trend="All time"
          />
        </Box>

        {/* ── PRODUCT SALES CHART ──────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px", p: "24px",
          background: theme.palette.background.paper,
          mb: "24px",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "20px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: theme.palette.primary.light,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.palette.primary.main,
              }}>
                <BarChartOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: "1rem",
                  color: theme.palette.text.primary,
                }}>
                  Product Sales
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Top {chartData.length} products by quantity sold
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${chartData.length} products`}
              size="small"
              sx={{
                fontWeight: 700, fontSize: "0.7rem",
                background: theme.palette.primary.light,
                color: theme.palette.primary.main,
                height: 24, borderRadius: "6px",
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={28} sx={{ borderRadius: "8px" }} />
              ))}
            </Box>
          ) : chartData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: "40px" }}>
              <Typography sx={{ color: theme.palette.text.disabled, fontSize: "0.875rem" }}>
                No sales data available
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 48, 200)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  type="number"
                  tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  dataKey="product" type="category" width={150}
                  tick={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fill: theme.palette.text.primary, fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <RechartTooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.primary.light, radius: 6 }} />
                <Bar dataKey="sales" barSize={14} radius={[0, 8, 8, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index % 3 === 0
                        ? theme.palette.primary.main
                        : index % 3 === 1
                        ? theme.palette.info.main
                        : "#60A5FA"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* ── INVOICES TABLE ───────────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "16px", overflow: "hidden",
          background: theme.palette.background.paper,
        }}>
          {/* Table header bar */}
          <Box sx={{
            px: "24px", py: "18px",
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: "10px",
                background: theme.palette.primary.light,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.palette.primary.main,
              }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: "1rem",
                color: theme.palette.text.primary,
              }}>
                All Invoices
              </Typography>
            </Box>
            <Chip
              label={`${filteredInvoices.length} records`}
              size="small"
              sx={{
                fontWeight: 700, fontSize: "0.7rem",
                background: theme.palette.primary.light,
                color: theme.palette.primary.main,
                height: 24, borderRadius: "6px",
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ p: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <LinearProgress sx={{ borderRadius: "4px", "& .MuiLinearProgress-bar": { background: theme.palette.primary.main } }} />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
              ))}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ background: theme.palette.background.default }}>
                  {["Invoice", "Customer", "Phone", "Items", "Total", "Mode", "Profit", ""].map((h) => (
                    <TableCell key={h} sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700, fontSize: "0.72rem",
                      color: theme.palette.text.secondary,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: "12px",
                    }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", py: "48px", color: theme.palette.text.disabled, border: 0 }}>
                      No invoices match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((row, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => navigate(`/invoice/${row._id}`)}
                      sx={{
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                        "&:hover": { background: theme.palette.background.default },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      {/* Invoice number */}
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700, fontSize: "0.85rem",
                          color: theme.palette.primary.main,
                        }}>
                          #{row.invoiceNumber}
                        </Typography>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar sx={{
                            width: 30, height: 30,
                            fontSize: "0.75rem", fontWeight: 700,
                            background: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                          }}>
                            {row.customerName?.[0]?.toUpperCase() ?? "?"}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: theme.palette.text.primary }}>
                            {row.customerName}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Phone */}
                      <TableCell sx={{ fontSize: "0.875rem", color: theme.palette.text.secondary }}>
                        {row.phone}
                      </TableCell>

                      {/* Items */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: 260 }}>
                          {row.items?.slice(0, 2).map((i, k) => (
                            <Chip
                              key={k}
                              label={`${i.item} ×${i.qty}`}
                              size="small"
                              sx={{
                                fontSize: "0.7rem", fontWeight: 600,
                                background: theme.palette.background.default,
                                color: theme.palette.text.secondary,
                                border: `1px solid ${theme.palette.divider}`,
                                height: 22, borderRadius: "6px",
                              }}
                            />
                          ))}
                          {row.items?.length > 2 && (
                            <Chip
                              label={`+${row.items.length - 2}`}
                              size="small"
                              sx={{
                                fontSize: "0.7rem", fontWeight: 700,
                                background: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                                height: 22, borderRadius: "6px",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: theme.palette.text.primary }}>
                          ₹{Number(row.total).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>

                      {/* Payment mode */}
                      <TableCell>
                        <Chip
                          label={row.paymode || "—"}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: "0.72rem",
                            height: 22, borderRadius: "6px",
                            background: row.paymode === "Cash"
                              ? theme.palette.success.light
                              : row.paymode === "Online"
                              ? theme.palette.info.light
                              : theme.palette.background.default,
                            color: row.paymode === "Cash"
                              ? theme.palette.success.dark
                              : row.paymode === "Online"
                              ? theme.palette.info.dark
                              : theme.palette.text.secondary,
                          }}
                        />
                      </TableCell>

                      {/* Profit */}
                      <TableCell>
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          background: theme.palette.success.light,
                          color: theme.palette.success.dark,
                          borderRadius: "8px", px: "10px", py: "3px",
                        }}>
                          <ArrowUpwardRoundedIcon sx={{ fontSize: 12 }} />
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                            ₹{Number(row.profit).toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Open icon */}
                      <TableCell>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: theme.palette.text.disabled,
                          "&:hover": { color: theme.palette.primary.main, background: theme.palette.primary.light },
                          transition: "all 0.15s ease",
                        }}>
                          <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>
    </Box>
  );
}