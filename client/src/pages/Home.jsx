import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Tooltip, Avatar, Chip, useTheme,
} from "@mui/material";
import DownloadReportButton from "../components/DownloadReportButton";
import NotificationBell from "../components/NotificationBell";
import BorderGlow from "../components/React Bits/BorderGlow";
import CountUp from "../components/React Bits/CountUp";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DailyProfitChart from "../components/Chart";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LogoutIcon from "@mui/icons-material/Logout";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";


// ─── Inject keyframes once ─────────────────────────────────────────────────────
const injectKeyframes = () => {
  if (document.getElementById("invomate-keyframes")) return;
  const style = document.createElement("style");
  style.id = "invomate-keyframes";
  style.textContent = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(18px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(8px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.75); }
    }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
      40%           { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes ringPulse {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes fabFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-4px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes navPop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.18); }
      100% { transform: scale(1); }
    }
    @keyframes rowSlideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, sub, index = 0 }) => (
  <Paper elevation={0} sx={{
    borderRadius: "16px",
    p: "20px 22px",
    background: "#FFFFFF",
    border: "1px solid #E8ECF0",
    display: "flex", flexDirection: "column", gap: "14px",
    position: "relative", overflow: "hidden",
    cursor: "default",
    animation: "fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
    animationDelay: `${index * 0.07}s`,
    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    "&:hover": {
      transform: "translateY(-12px) translateZ(20px) scale(1.02)",
      boxShadow: `0 20px 48px ${accent}35, 0 8px 24px ${accent}20, 0 2px 8px rgba(15,23,42,0.08)`,
      border: `1px solid ${accent}40`,
      zIndex: 10,
    },
    "&::before": {
      content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3px",
      background: `linear-gradient(90deg, ${accent}, ${accent}CC)`,
      borderRadius: "16px 16px 0 0",
      transition: "height 0.35s ease, background 0.35s ease",
    },
    "&:hover::before": { 
      height: "5px",
      background: `linear-gradient(90deg, ${accent}, ${accent}FF)`,
    },
  }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: "10px",
        background: `${accent}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease",
        ".MuiPaper-root:hover &": { transform: "scale(1.12) rotate(-6deg)", background: `${accent}28` },
      }}>
        {icon}
      </Box>
      {sub && (
        <Typography component="span" sx={{
          fontSize: "0.7rem", fontWeight: 600, px: 1, py: 0.35, borderRadius: "6px",
          background: `${accent}12`, color: accent,
          transition: "background 0.2s ease",
        }}>{sub}</Typography>
      )}
    </Box>
    <Box>
      <Typography component="div" sx={{
        fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", lineHeight: 1,
        fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em",
        transition: "color 0.2s ease",
        ".MuiPaper-root:hover &": { color: accent },
      }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, color: "#64748B", mt: 0.6, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon, label, onClick, active = false }) => (
  <Tooltip title={label} placement="right" arrow>
    <Box onClick={onClick} sx={{
      width: 42, height: 42, borderRadius: "11px",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
      color: active ? "#2563EB" : "#94A3B8",
      background: active ? "#EFF6FF" : "transparent",
      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      position: "relative",
      "&:hover": {
        background: "#EFF6FF",
        color: "#2563EB",
        transform: "scale(1.12)",
        boxShadow: "0 4px 12px rgba(37,99,235,0.18)",
      },
      "&:active": { transform: "scale(0.93)" },
    }}>
      {icon}
    </Box>
  </Tooltip>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    injectKeyframes();
    // slight delay so entrance animations fire after mount
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/user", {
          credentials: 'include', // Enable cookies
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data._id) {
          setUserId(data._id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const fetchInvoices = async () => {
    const res = await fetch("http://localhost:5000/api/auth/getinvoices", {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
  };

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/api/auth/getproducts", {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  const fetchProfile = async () => {
    const res = await fetch("http://localhost:5000/api/auth/findprofile", {
      credentials: 'include', // Enable cookies
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setShopName(data.ShopName ?? "");
  };

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
    fetchProfile();
  }, []);

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const todayInvoices = invoices.filter(inv => inv.date === formattedToday);
  const todayProfit = todayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const lowStockProducts = products.filter(p => Number(p.Stock) <= 5);
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  // Calculate week profit (last 7 days)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const weekInvoices = invoices.filter(inv => {
    const [day, month, year] = inv.date.split('-');
    const invDate = new Date(year, month - 1, day);
    return invDate >= sevenDaysAgo && invDate <= today;
  });
  const totalWeekProfit = weekInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
  
  // Calculate average profit
  const avgProfit = invoices.length > 0 
    ? invoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0) / invoices.length 
    : 0;

  // Calculate yesterday's profit for comparison
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const formattedYesterday = `${String(yesterday.getDate()).padStart(2, "0")}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${yesterday.getFullYear()}`;
  const yesterdayInvoices = invoices.filter(inv => inv.date === formattedYesterday);
  const yesterdayProfit = yesterdayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
  const changeVsYest = yesterdayProfit > 0 
    ? (((todayProfit - yesterdayProfit) / yesterdayProfit) * 100).toFixed(1)
    : 0;

  const businessData = {
    totalRevenue, todayProfit, todayRevenue,
    totalInvoices: invoices.length,
    todayInvoiceCount: todayInvoices.length,
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.map(p => ({ name: p.item, stock: p.Stock })),
    recentInvoices: recentInvoices.map(inv => ({
      invoiceNumber: inv.invoiceNumber, customer: inv.customerName,
      total: inv.total, profit: inv.profit, date: inv.date,
    })),
    products: products.map(p => ({
      name: p.item, stock: p.Stock, price: p.Price, category: p.Category,
    })),
  };

  const dayName = today.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Box sx={{
      display: "flex", minHeight: "100vh",
      background: "#F6F8FB",
      fontFamily: "'DM Sans', sans-serif",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        width: 68, flexShrink: 0,
        background: "#FFFFFF",
        borderRight: "1px solid #E8ECF0",
        display: "flex", flexDirection: "column", alignItems: "center",
        py: "20px", gap: "4px",
        position: "sticky", top: 0, height: "100vh",
        animation: "fadeIn 0.4s ease both",
        boxShadow: "2px 0 16px rgba(15,23,42,0.04)",
      }}>
        {/* Logo */}
        <Box onClick={() => navigate("/home")} sx={{
          width: 38, height: 38, borderRadius: "10px",
          background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          mb: "20px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
          "&:hover": {
            transform: "scale(1.12) rotate(-8deg)",
            boxShadow: "0 8px 22px rgba(37,99,235,0.48)",
          },
          "&:active": { transform: "scale(0.94)" },
        }}>
          <GridViewRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
        </Box>

        {["New Invoice", "Invoices", "Products", "Profile"].map((label, i) => {
          const icons = [
            <AddCircleOutlineIcon fontSize="small" />,
            <ReceiptLongOutlinedIcon fontSize="small" />,
            <InventoryIcon fontSize="small" />,
            <StorefrontOutlinedIcon fontSize="small" />,
          ];
          const paths = ["/createbill", "/invoices", "/products", "/profile"];
          return (
            <Box key={label} sx={{
              animation: "fadeSlideUp 0.35s ease both",
              animationDelay: `${0.12 + i * 0.06}s`,
            }}>
              <NavItem icon={icons[i]} label={label} onClick={() => navigate(paths[i])} />
            </Box>
          );
        })}

        {/* Divider */}
        <Box sx={{
          mt: "auto", pt: 2, borderTop: "1px solid #F1F5F9", width: "40px",
          animation: "fadeIn 0.3s ease 0.5s both",
        }} />
        <Box sx={{ animation: "fadeSlideUp 0.35s ease 0.55s both" }}>
          <NavItem icon={<LogoutIcon fontSize="small" />} label="Logout" onClick={handleLogout} />
        </Box>
      </Box>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* ── TOP NAV ── */}
        <Box sx={{
          px: "32px", py: "16px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E8ECF0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          animation: "fadeIn 0.35s ease 0.05s both",
          boxShadow: "0 1px 12px rgba(15,23,42,0.05)",
          backdropFilter: "blur(8px)",
        }}>
          <Box sx={{ animation: "fadeSlideUp 0.35s ease 0.1s both" }}>
            <Typography sx={{
              fontSize: "1.15rem", fontWeight: 700, color: "#0F172A",
              fontFamily: "'Sora', sans-serif", lineHeight: 1.2,
            }}>
              {shopName ? `Good day, ${shopName} 👋` : "Dashboard"}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", mt: "2px", fontFamily: "'DM Sans', sans-serif" }}>
              {dayName}, {dateStr}
            </Typography>
          </Box>

          <Box sx={{
            display: "flex", gap: "10px", alignItems: "center",
            animation: "fadeSlideUp 0.35s ease 0.15s both",
          }}>
            {/* Notification Bell */}
            {userId && <NotificationBell userId={userId} />}

            <Button
              startIcon={<AddCircleOutlineIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => navigate("/createbill")}
              variant="contained"
              sx={{
                textTransform: "none", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.84rem",
                borderRadius: "10px", px: "16px", height: 38,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(37,99,235,0.44)",
                  transform: "translateY(-2px) scale(1.02)",
                },
                "&:active": { transform: "scale(0.97)" },
              }}>
              New Invoice
            </Button>

            {/* DOWNLOAD REPORT BUTTON */}
            <Box sx={{
              "& button": {
                height: 38,
                borderRadius: "10px",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0 14px",
                background: "#10B981",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              },
              "& button:hover": {
                background: "#059669",
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 6px 18px rgba(16,185,129,0.38)",
              },
              "& button:active": { transform: "scale(0.97)" },
            }}>
              <DownloadReportButton date={new Date().toISOString().split('T')[0]} />
            </Box>

            <Button
              startIcon={<LogoutIcon sx={{ fontSize: "16px !important" }} />}
              onClick={handleLogout}
              variant="outlined"
              sx={{
                textTransform: "none", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.84rem",
                borderRadius: "10px", px: "16px", height: 38,
                borderColor: "#FCA5A5", color: "#EF4444",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "#FEF2F2", borderColor: "#EF4444",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.18)",
                },
                "&:active": { transform: "scale(0.97)" },
              }}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* ── PAGE BODY ── */}
        <Box sx={{ p: "28px 32px", flex: 1 }}>

          {/* ── STAT CARDS ── */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" },
            gap: "16px", mb: "24px",
          }}>
            {[
              {
                icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />,
                label: "Total Invoices",
                value: invoices.length,
                accent: "#2563EB",
                numeric: invoices.length,
                prefix: "",
              },
              {
                icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
                label: "Today's Profit",
                value: `₹${todayProfit.toLocaleString("en-IN")}`,
                accent: "#0EA5E9",
                numeric: todayProfit,
                prefix: "₹",
              },
              {
                icon: <CurrencyRupeeIcon sx={{ fontSize: 18 }} />,
                label: "Total Revenue",
                value: `₹${totalRevenue.toLocaleString("en-IN")}`,
                accent: "#10B981",
                numeric: totalRevenue,
                prefix: "₹",
              },
              {
                icon: <TodayOutlinedIcon sx={{ fontSize: 18 }} />,
                label: "Today's Bills",
                value: todayInvoices.length,
                accent: "#F59E0B",
                sub: `₹${todayRevenue.toLocaleString("en-IN")}`,
                numeric: todayInvoices.length,
                prefix: "",
              },
              {
                icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
                label: "Total Products",
                value: products.length,
                accent: "#8B5CF6",
                sub: `${lowStockProducts.length} low stock`,
                numeric: products.length,
                prefix: "",
              },
            ].map((card, i) => (
              <BorderGlow
                key={card.label}
                color={card.accent}
                glowSize={120}
                duration={6}
              >
                <StatCard
                  {...card}
                  index={i}
                  value={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1.7rem",
                          fontWeight: 800,
                          color: "inherit",
                          lineHeight: 1,
                        }}
                      >
                        {card.prefix}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "1.7rem",
                          fontWeight: 800,
                          color: "inherit",
                          lineHeight: 1,
                        }}
                      >
                        <CountUp
                          from={0}
                          to={card.numeric}
                          separator=","
                          duration={2}
                        />
                      </Typography>
                    </Box>
                  }
                />
              </BorderGlow>
            ))}
          </Box>

          {/* ── TWO-COLUMN: Chart + Low Stock ── */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 300px" },
            gap: "16px", mb: "24px",
          }}>
            {/* Chart */}
            <Paper elevation={0} sx={{
              borderRadius: "20px",
              border: "2px solid transparent",
              background: "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #FCD34D 0%, #FBBF24 50%, #F59E0B 100%) border-box",
              overflow: "hidden",
              position: "relative",
              animation: "fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 20px 48px rgba(251,191,36,0.20), 0 8px 16px rgba(245,158,11,0.12)",
                border: "2px solid transparent",
                background: "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #FDE68A 0%, #FCD34D 50%, #FBBF24 100%) border-box",
              },
            }}>
  <Box sx={{
    px: "22px", py: "16px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  }}>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: "0.925rem", color: theme.palette.text.primary, fontFamily: "'Sora', sans-serif" }}>
        Daily Profit
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary, mt: "2px" }}>
        Last 7 days performance
      </Typography>
    </Box>
    <Box sx={{
      px: 1.5, py: 0.5,
      borderRadius: "8px",
      background: "rgba(16,185,129,0.1)",
      border: "1px solid rgba(16,185,129,0.2)",
      color: "#10B981",
      fontSize: "0.72rem", fontWeight: 700,
      display: "flex", alignItems: "center", gap: 0.7,
    }}>
      <Box sx={{
        width: 7, height: 7, borderRadius: "50%", background: "#10B981",
        position: "relative",
        "&::after": {
          content: '""', position: "absolute", inset: "-3px",
          borderRadius: "50%", background: "rgba(16,185,129,0.35)",
          animation: "pulseRing 1.6s ease-out infinite",
        },
      }} />
      Live
    </Box>
  </Box>

  {/* Stat pills row */}
  <Box sx={{ display: "flex", borderBottom: `1px solid ${theme.palette.divider}` }}>
    {[
      { label: "Total week", value: `₹${totalWeekProfit.toLocaleString("en-IN")}`, change: "+12%", up: true },
      { label: "Daily avg", value: `₹${avgProfit.toLocaleString("en-IN")}`, change: "+5%", up: true },
      { label: "Today", value: `₹${todayProfit.toLocaleString("en-IN")}`, change: `${changeVsYest}%`, up: changeVsYest >= 0 },
    ].map((s, i) => (
      <Box key={i} sx={{
        flex: 1, px: "16px", py: "12px",
        borderRight: i < 2 ? `1px solid ${theme.palette.divider}` : "none",
      }}>
        <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color: theme.palette.text.disabled, textTransform: "uppercase", letterSpacing: "0.06em", mb: "2px" }}>
          {s.label}
        </Typography>
        <Typography sx={{ fontSize: "1rem", fontWeight: 800, fontFamily: "'Sora', sans-serif", color: theme.palette.text.primary }}>
          {s.value}
        </Typography>
        <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color: s.up ? "#10B981" : "#EF4444", mt: "1px" }}>
          {s.up ? "▲" : "▼"} {s.change} vs prev
        </Typography>
      </Box>
    ))}
  </Box>

  <Box sx={{ p: "16px" }}>
    <DailyProfitChart invoices={invoices} />
  </Box>
</Paper>

            {/* Low Stock Panel */}
            <Paper elevation={0} sx={{
              borderRadius: "16px",
              border: "1px solid #E8ECF0",
              background: "#FFFFFF",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              animation: "fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.38s both",
              transition: "box-shadow 0.25s ease",
              "&:hover": { boxShadow: "0 8px 28px rgba(15,23,42,0.08)" },
            }}>
              <Box sx={{
                px: "20px", py: "16px", borderBottom: "1px solid #F1F5F9",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.925rem", color: "#0F172A", fontFamily: "'Sora', sans-serif" }}>
                  Low Stock Alert
                </Typography>
                {lowStockProducts.length > 0 && (
                  <Box sx={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#FEF2F2", color: "#EF4444",
                    fontSize: "0.65rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
                  }}>
                    {lowStockProducts.length}
                  </Box>
                )}
              </Box>
              <Box sx={{
                flex: 1, overflowY: "auto", px: "16px", py: "12px",
                display: "flex", flexDirection: "column", gap: "8px",
                "&::-webkit-scrollbar": { width: "3px" },
                "&::-webkit-scrollbar-thumb": { background: "#E2E8F0", borderRadius: "2px" },
              }}>
                {lowStockProducts.length === 0 ? (
                  <Box sx={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", py: 4, gap: 1,
                    animation: "scaleIn 0.35s ease both",
                  }}>
                    <Box sx={{ fontSize: "1.8rem" }}>✅</Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", textAlign: "center" }}>
                      All products are well-stocked
                    </Typography>
                  </Box>
                ) : (
                  lowStockProducts.slice(0, 8).map((p, i) => (
                    <Box key={i} onClick={() => navigate("/products")} sx={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      px: "12px", py: "10px", borderRadius: "10px",
                      background: "#FAFBFC", border: "1px solid #F1F5F9",
                      cursor: "pointer",
                      animation: "fadeSlideUp 0.3s ease both",
                      animationDelay: `${0.4 + i * 0.05}s`,
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                      "&:hover": {
                        background: "#FEF2F2", borderColor: "#FECACA",
                        transform: "translateX(3px) scale(1.01)",
                        boxShadow: "0 2px 10px rgba(239,68,68,0.12)",
                      },
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{
                          width: 30, height: 30, borderRadius: "8px",
                          background: "#FEF2F2", color: "#EF4444",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                          ".MuiBox-root:hover &": { transform: "scale(1.15) rotate(-6deg)" },
                        }}>
                          <Inventory2OutlinedIcon sx={{ fontSize: 14 }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.825rem", fontWeight: 600, color: "#1E293B" }}>
                          {p.item}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${p.Stock} left`}
                        size="small"
                        sx={{
                          fontSize: "0.68rem", fontWeight: 700,
                          background: Number(p.Stock) === 0 ? "#FEE2E2" : "#FEF3C7",
                          color: Number(p.Stock) === 0 ? "#DC2626" : "#D97706",
                          height: 20, border: "none",
                          transition: "transform 0.2s ease",
                          "&:hover": { transform: "scale(1.06)" },
                        }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Box>

          {/* ── RECENT INVOICES ── */}
          <Paper elevation={0} sx={{
            borderRadius: "16px",
            border: "1px solid #E8ECF0",
            background: "#FFFFFF",
            overflow: "hidden",
            animation: "fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.45s both",
            transition: "box-shadow 0.25s ease",
            "&:hover": { boxShadow: "0 8px 28px rgba(15,23,42,0.07)" },
          }}>
            <Box sx={{
              px: "24px", py: "16px", borderBottom: "1px solid #F1F5F9",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.925rem", color: "#0F172A", fontFamily: "'Sora', sans-serif" }}>
                  Recent Invoices
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: "2px" }}>Latest {recentInvoices.length} transactions</Typography>
              </Box>
              <Button
                onClick={() => navigate("/invoices")}
                size="small"
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                  color: "#2563EB", background: "#EFF6FF",
                  borderRadius: "8px", px: 1.5,
                  transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  "&:hover": {
                    background: "#DBEAFE",
                    transform: "translateX(3px)",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.18)",
                  },
                }}>
                View all →
              </Button>
            </Box>

            {/* Table Header */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "140px 1.5fr 1fr 0.8fr 1fr 0.8fr 1fr",
              gap: "16px",
              px: "20px",
              py: "14px",
              background: "#F8FAFC",
              borderBottom: "1px solid #F1F5F9",
            }}>
              {["INVOICE", "CUSTOMER", "PHONE", "ITEMS", "TOTAL", "MODE", "PROFIT"].map(h => (
                <Typography key={h} sx={{
                  fontWeight: 600, fontSize: "0.68rem", color: "#94A3B8",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {recentInvoices.length === 0 ? (
              <Box sx={{ py: "48px" }}>
                <Box sx={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  animation: "scaleIn 0.35s ease both",
                }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>🧾</Typography>
                  <Typography sx={{ color: "#94A3B8", fontSize: "0.875rem", fontWeight: 500 }}>No invoices yet</Typography>
                  <Button
                    onClick={() => navigate("/createbill")} size="small"
                    sx={{
                      textTransform: "none", color: "#2563EB", fontWeight: 600, fontSize: "0.8rem", mt: 0.5,
                      transition: "all 0.2s ease",
                      "&:hover": { transform: "translateX(3px)" },
                    }}>
                    Create your first invoice →
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentInvoices.map((inv, i) => (
                  <Box
                    key={i}
                    onClick={() => navigate(`/invoice/${inv._id}`)}
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
                      animation: `fadeSlideUp 0.3s ease ${i * 0.05}s both`,
                      "&:hover": {
                        background: "#F8FAFF",
                        borderColor: "#DBEAFE",
                        transform: "translateX(4px)",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.08)",
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
                          {inv.invoiceNumber}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Customer */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Avatar sx={{
                        width: 38, height: 38, fontSize: "0.8rem", fontWeight: 700,
                        background: `linear-gradient(135deg, ${['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][i % 5]}, ${['#DC2626', '#D97706', '#059669', '#2563EB', '#7C3AED'][i % 5]})`,
                        color: "#fff",
                        border: "2px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}>
                        {inv.customerName?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B" }}>
                        {inv.customerName}
                      </Typography>
                    </Box>

                    {/* Phone */}
                    <Typography sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}>
                      {inv.phone || "+91 XXXXX XXXXX"}
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
                        {inv.items?.length ?? 0}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                        items
                      </Typography>
                    </Box>

                    {/* Total */}
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
                      ₹{Number(inv.total || 0).toLocaleString("en-IN")}
                    </Typography>

                    {/* Payment Mode */}
                    <Chip
                      icon={
                        inv.paymode === "Cash" ? <CurrencyRupeeIcon sx={{ fontSize: 14 }} /> :
                        inv.paymode === "UPI" ? <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>₹</Box> :
                        inv.paymode === "Card" ? <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>💳</Box> :
                        <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>🏦</Box>
                      }
                      label={inv.paymode || "Cash"}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        height: 28,
                        borderRadius: "8px",
                        background: 
                          inv.paymode === "Cash" ? "#D1FAE5" :
                          inv.paymode === "UPI" ? "#E0E7FF" :
                          inv.paymode === "Card" ? "#DBEAFE" :
                          "#FEF3C7",
                        color:
                          inv.paymode === "Cash" ? "#065F46" :
                          inv.paymode === "UPI" ? "#4338CA" :
                          inv.paymode === "Card" ? "#1E40AF" :
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
                      color: Number(inv.profit || 0) >= 0 ? "#10B981" : "#EF4444",
                    }}>
                      <TrendingUpIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        ₹{Number(inv.profit || 0).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;