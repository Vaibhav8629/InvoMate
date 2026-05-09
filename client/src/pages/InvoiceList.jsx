import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Chip, TextField, Button,
  InputAdornment, Avatar, Skeleton, Tooltip, LinearProgress,
  useTheme,
} from "@mui/material";
import BorderGlow from "../components/React Bits/BorderGlow";

import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Invoices() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    const res = await fetch("http://localhost:5000/api/auth/getinvoices", {
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

  const totalRevenue = filteredInvoices.reduce((a, b) => a + Number(b.total || 0), 0);
  const totalProfit = filteredInvoices.reduce((a, b) => a + Number(b.profit || 0), 0);

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

        <NavItem icon={<AddCircleOutlineIcon fontSize="small" />} label="New Invoice" onClick={() => navigate("/createbill")} />
        <NavItem icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Invoices" onClick={() => navigate("/invoices")} active />
        <NavItem icon={<Inventory2OutlinedIcon fontSize="small" />} label="Products" onClick={() => navigate("/products")} />
        <NavItem icon={<StorefrontOutlinedIcon fontSize="small" />} label="Profile" onClick={() => navigate("/profile")} />

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
        <Box
  sx={{
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: "repeat(3, 1fr)",
    },
    gap: "24px",
    mb: "28px",
  }}
>
  <StatCard
    icon={<ReceiptLongOutlinedIcon />}
    label="Total Invoices"
    value={loading ? "—" : filteredInvoices.length}
    bg="linear-gradient(135deg,#DBEAFE,#BFDBFE)"
    iconColor="#2563EB"
    trend="+12%"
  />

  <StatCard
    icon={<CurrencyRupeeIcon />}
    label="Total Revenue"
    value={
      loading
        ? "—"
        : `₹${totalRevenue.toLocaleString("en-IN")}`
    }
    bg="linear-gradient(135deg,#DCFCE7,#BBF7D0)"
    iconColor="#10B981"
    trend="+18%"
  />

  <StatCard
    icon={<TrendingUpIcon />}
    label="Total Profit"
    value={
      loading
        ? "—"
        : `₹${totalProfit.toLocaleString("en-IN")}`
    }
    bg="linear-gradient(135deg,#E0F2FE,#BAE6FD)"
    iconColor="#0EA5E9"
    trend="+9%"
  />
</Box>

        {/* ── PRODUCT SALES CHART ──────────────────────────────────────── */}


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
            <>
              {/* Table Header */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "140px 1.5fr 1fr 0.8fr 1fr 0.8fr 1fr",
                gap: "16px",
                px: "20px",
                py: "14px",
                background: theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}>
                {["INVOICE", "CUSTOMER", "PHONE", "ITEMS", "TOTAL", "MODE", "PROFIT"].map(h => (
                  <Typography key={h} sx={{
                    fontWeight: 600, fontSize: "0.68rem", color: theme.palette.text.secondary,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              {filteredInvoices.length === 0 ? (
                <Box sx={{ py: "48px", textAlign: "center" }}>
                  <Typography sx={{ color: theme.palette.text.disabled, fontSize: "0.875rem" }}>
                    No invoices match your search
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredInvoices.map((row, idx) => (
                    <BorderGlow
                      key={row._id || idx}
                      color="#2563EB"
                      glowSize={150}
                      borderRadius={12}
                    >
                      <Box
                        onClick={() => navigate(`/invoice/${row._id}`)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "140px 1.5fr 1fr 0.8fr 1fr 0.8fr 1fr",
                          gap: "16px",
                          alignItems: "center",
                          px: "16px",
                          py: "16px",
                          background: "#FAFBFC",
                          borderRadius: "12px",
                          border: "1px solid #F1F5F9",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                          animation: `fadeSlideUp 0.3s ease ${idx * 0.05}s both`,
                          "&:hover": {
                            background: "#F8FAFF",
                            borderColor: "#DBEAFE",
                            transform: "translateX(4px)",
                            boxShadow: "0 4px 12px rgba(37,99,235,0.08)",
                          },
                          "@keyframes fadeSlideUp": {
                            from: { opacity: 0, transform: "translateY(12px)" },
                            to: { opacity: 1, transform: "translateY(0px)" },
                          },
                        }}
                      >
                        {/* Invoice Number */}
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#EFF6FF",
                          borderRadius: "10px",
                          px: "12px",
                          py: "10px",
                        }}>
                          <ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
                          <Box>
                            <Typography sx={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 600 }}>
                              INV-
                            </Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB", lineHeight: 1 }}>
                              {row.invoiceNumber}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Customer */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Avatar sx={{
                            width: 38, height: 38, fontSize: "0.8rem", fontWeight: 700,
                            background: `linear-gradient(135deg, ${['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][idx % 5]}, ${['#DC2626', '#D97706', '#059669', '#2563EB', '#7C3AED'][idx % 5]})`,
                            color: "#fff",
                            border: "2px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}>
                            {row.customerName?.[0]?.toUpperCase() ?? "?"}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B" }}>
                            {row.customerName}
                          </Typography>
                        </Box>

                        {/* Phone */}
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}>
                          {row.phone || "+91 XXXXX XXXXX"}
                        </Typography>

                        {/* Items */}
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#F1F5F9",
                          borderRadius: "8px",
                          px: "10px",
                          py: "6px",
                          width: "fit-content",
                        }}>
                          <Inventory2OutlinedIcon sx={{ fontSize: 14, color: "#64748B" }} />
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                            {row.items?.length ?? 0}
                          </Typography>
                          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            items
                          </Typography>
                        </Box>

                        {/* Total */}
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                          ₹{Number(row.total || 0).toLocaleString("en-IN")}
                        </Typography>

                        {/* Payment Mode */}
                        <Chip
                          icon={
                            row.paymode === "Cash" ? <CurrencyRupeeIcon sx={{ fontSize: 14 }} /> :
                            row.paymode === "UPI" ? <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>₹</Box> :
                            row.paymode === "Card" ? <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>💳</Box> :
                            <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>🏦</Box>
                          }
                          label={row.paymode || "Cash"}
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            height: 28,
                            borderRadius: "8px",
                            background: 
                              row.paymode === "Cash" ? "#D1FAE5" :
                              row.paymode === "UPI" ? "#E0E7FF" :
                              row.paymode === "Card" ? "#DBEAFE" :
                              "#FEF3C7",
                            color:
                              row.paymode === "Cash" ? "#065F46" :
                              row.paymode === "UPI" ? "#4338CA" :
                              row.paymode === "Card" ? "#1E40AF" :
                              "#92400E",
                            border: "none",
                            "& .MuiChip-icon": {
                              color: "inherit",
                            },
                          }}
                        />

                        {/* Profit */}
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: Number(row.profit || 0) >= 0 ? "#10B981" : "#EF4444",
                        }}>
                          <TrendingUpIcon sx={{ fontSize: 14 }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            ₹{Number(row.profit || 0).toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                      </Box>
                    </BorderGlow>
                  ))}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}