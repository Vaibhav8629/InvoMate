import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Tooltip, Avatar, Chip, useTheme,
  Drawer, TextField, IconButton, CircularProgress,
} from "@mui/material";
import DownloadReportButton from "../components/DownloadReportButton";
import NotificationBell from "../components/NotificationBell";
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
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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

// ─── Gemini Chat API ───────────────────────────────────────────────────────────
const callGeminiChat = async (question, businessData) => {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_KEY in .env");

  const prompt = `You are InvoMate's friendly AI business assistant. Answer the user's question using the business data below.
Keep your reply short (2–5 sentences), conversational, and use real numbers from the data where possible.
Do NOT use markdown, bullet points, or asterisks — just plain natural text.

Business Data: ${JSON.stringify(businessData)}

User Question: ${question}

Answer:`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${e?.error?.message}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    || "Sorry, I couldn't generate a response right now.";
};

const SUGGESTIONS = [
  "What's my total profit today?",
  "Which is my top selling product?",
  "How many invoices this month?",
  "What's my total revenue?",
  "Which products are low on stock?",
  "How can I improve my margins?",
];

// ─── AI Chat Drawer ────────────────────────────────────────────────────────────
const AIChatDrawer = ({ open, onClose, businessData }) => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hey! 👋 I'm your InvoMate AI assistant. Ask me anything about your business — revenue, profits, top products, stock levels, and more!",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const reply = await callGeminiChat(q, businessData);
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: `Oops! ${e.message}`, error: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 400 },
          display: "flex",
          flexDirection: "column",
          background: "#FAFBFC",
          boxShadow: "-20px 0 60px rgba(15,23,42,0.12)",
          overflow: "hidden",
          borderLeft: "1px solid #E8ECF0",
          animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1) both",
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        background: "#fff",
        borderBottom: "1px solid #E8ECF0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeIn 0.3s ease 0.1s both",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "10px",
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": { transform: "rotate(-8deg) scale(1.08)", boxShadow: "0 6px 18px rgba(37,99,235,0.4)" },
          }}>
            <SmartToyRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.925rem", color: "#0F172A", lineHeight: 1.2 }}>
              InvoMate AI
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
              <Box sx={{
                width: 5, height: 5, borderRadius: "50%", background: "#22C55E",
                animation: "pulseDot 1.8s ease-in-out infinite",
              }} />
              <Typography sx={{ fontSize: "0.68rem", color: "#64748B", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                Powered by Gemini 2.5 Flash
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{
          color: "#64748B", background: "#F1F5F9", borderRadius: "8px",
          width: 30, height: 30,
          transition: "all 0.18s ease",
          "&:hover": { background: "#E2E8F0", color: "#0F172A", transform: "rotate(90deg)" },
        }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1, overflowY: "auto", px: 2.5, py: 2,
        display: "flex", flexDirection: "column", gap: 1.5,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "2px" },
      }}>
        {messages.map((msg, i) => (
          <Box key={i} sx={{
            display: "flex", gap: 1,
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-end",
            animation: "msgIn 0.24s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: `${i * 0.04}s`,
          }}>
            {msg.role === "ai" && (
              <Box sx={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center", mb: 0.25,
              }}>
                <SmartToyRoundedIcon sx={{ fontSize: 13, color: "#fff" }} />
              </Box>
            )}
            <Box sx={{
              maxWidth: "75%", px: 1.75, py: 1.1,
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                : msg.error ? "#FEF2F2" : "#FFFFFF",
              border: msg.role === "ai" ? `1px solid ${msg.error ? "#FECACA" : "#E2E8F0"}` : "none",
              boxShadow: msg.role === "user" ? "0 4px 14px rgba(37,99,235,0.25)" : "0 1px 4px rgba(15,23,42,0.06)",
              transition: "box-shadow 0.2s ease",
              "&:hover": { boxShadow: msg.role === "user" ? "0 6px 20px rgba(37,99,235,0.35)" : "0 3px 10px rgba(15,23,42,0.1)" },
            }}>
              <Typography sx={{
                fontSize: "0.845rem", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif",
                color: msg.role === "user" ? "#fff" : msg.error ? "#DC2626" : "#1E293B",
              }}>
                {msg.text}
              </Typography>
            </Box>
            {msg.role === "user" && (
              <Box sx={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                display: "flex", alignItems: "center", justifyContent: "center", mb: 0.25,
              }}>
                <PersonRoundedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
              </Box>
            )}
          </Box>
        ))}

        {chatLoading && (
          <Box sx={{
            display: "flex", gap: 1, alignItems: "flex-end",
            animation: "fadeIn 0.2s ease both",
          }}>
            <Box sx={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SmartToyRoundedIcon sx={{ fontSize: 13, color: "#fff" }} />
            </Box>
            <Box sx={{
              px: 2, py: 1.25, borderRadius: "14px 14px 14px 4px",
              background: "#fff", border: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", gap: 0.5,
            }}>
              {[0, 1, 2].map(d => (
                <Box key={d} sx={{
                  width: 6, height: 6, borderRadius: "50%", background: "#2563EB",
                  animation: "typingBounce 1.2s ease-in-out infinite",
                  animationDelay: `${d * 0.2}s`,
                }} />
              ))}
            </Box>
          </Box>
        )}
        <div ref={chatEndRef} />
      </Box>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <Box sx={{
          px: 2.5, pb: 1.5, display: "flex", flexWrap: "wrap", gap: 0.75,
          animation: "fadeSlideUp 0.3s ease 0.2s both",
        }}>
          {SUGGESTIONS.map((s, i) => (
            <Box key={i} onClick={() => send(s)} sx={{
              px: 1.5, py: 0.6, borderRadius: "20px",
              fontSize: "0.71rem", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              background: "#EFF6FF", color: "#2563EB",
              border: "1px solid #BFDBFE", cursor: "pointer",
              transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
              animation: "fadeSlideUp 0.3s ease both",
              animationDelay: `${0.2 + i * 0.05}s`,
              "&:hover": {
                background: "#2563EB", color: "#fff", borderColor: "#2563EB",
                transform: "translateY(-2px) scale(1.04)",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              },
              "&:active": { transform: "scale(0.96)" },
            }}>
              {s}
            </Box>
          ))}
        </Box>
      )}

      {/* Input bar */}
      <Box sx={{
        px: 2.5, pb: 2.5, pt: 1.5,
        borderTop: "1px solid #E8ECF0", background: "#fff",
        display: "flex", gap: 1, alignItems: "center",
        animation: "fadeIn 0.3s ease 0.15s both",
      }}>
        <TextField
          fullWidth size="small"
          placeholder="Ask about revenue, stock, products…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          disabled={chatLoading}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", background: "#F8FAFC",
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem",
              transition: "background 0.18s ease",
              "& fieldset": { borderColor: "#E2E8F0", transition: "border-color 0.18s ease" },
              "&:hover fieldset": { borderColor: "#93C5FD" },
              "&.Mui-focused": { background: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
            },
          }}
        />
        <IconButton
          onClick={() => send()} disabled={!input.trim() || chatLoading}
          sx={{
            width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
            background: input.trim() ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#F1F5F9",
            color: input.trim() ? "#fff" : "#94A3B8",
            boxShadow: input.trim() ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
            transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            "&:not(:disabled):hover": {
              transform: "scale(1.1) rotate(-5deg)",
              boxShadow: "0 6px 18px rgba(37,99,235,0.42)",
            },
            "&:not(:disabled):active": { transform: "scale(0.94)" },
            "&:disabled": { background: "#F1F5F9", color: "#CBD5E1" },
          }}
        >
          {chatLoading
            ? <CircularProgress size={14} sx={{ color: "#94A3B8" }} />
            : <SendRoundedIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
    </Drawer>
  );
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
    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
    "&:hover": {
      transform: "translateY(-4px) scale(1.01)",
      boxShadow: `0 12px 32px ${accent}22, 0 2px 8px rgba(15,23,42,0.06)`,
    },
    "&::before": {
      content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "3px",
      background: accent, borderRadius: "16px 16px 0 0",
      transition: "height 0.25s ease",
    },
    "&:hover::before": { height: "4px" },
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
        <Typography sx={{
          fontSize: "0.7rem", fontWeight: 600, px: 1, py: 0.35, borderRadius: "6px",
          background: `${accent}12`, color: accent,
          transition: "background 0.2s ease",
        }}>{sub}</Typography>
      )}
    </Box>
    <Box>
      <Typography sx={{
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
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
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

        {["Dashboard", "New Invoice", "Invoices", "Products", "Profile"].map((label, i) => {
          const icons = [
            <GridViewRoundedIcon fontSize="small" />,
            <AddCircleOutlineIcon fontSize="small" />,
            <ReceiptLongOutlinedIcon fontSize="small" />,
            <InventoryIcon fontSize="small" />,
            <StorefrontOutlinedIcon fontSize="small" />,
          ];
          const paths = ["/dashboard", "/createbill", "/invoices", "/products", "/profile"];
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
              { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />, label: "Total Invoices", value: invoices.length, accent: "#2563EB" },
              { icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, label: "Today's Profit", value: `₹${todayProfit.toLocaleString("en-IN")}`, accent: "#0EA5E9" },
              { icon: <CurrencyRupeeIcon sx={{ fontSize: 18 }} />, label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, accent: "#10B981" },
              { icon: <TodayOutlinedIcon sx={{ fontSize: 18 }} />, label: "Today's Bills", value: todayInvoices.length, accent: "#F59E0B", sub: `₹${todayRevenue.toLocaleString("en-IN")}` },
              { icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />, label: "Total Products", value: products.length, accent: "#8B5CF6", sub: `${lowStockProducts.length} low stock` },
            ].map((card, i) => (
              <StatCard key={card.label} {...card} index={i} />
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
              borderRadius: "16px",
              border: "1px solid #E8ECF0",
              background: "#FFFFFF",
              overflow: "hidden",
              animation: "fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both",
              transition: "box-shadow 0.25s ease",
              "&:hover": { boxShadow: "0 8px 28px rgba(15,23,42,0.08)" },
            }}>
              <Box sx={{
                px: "22px", py: "16px", borderBottom: "1px solid #F1F5F9",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.925rem", color: "#0F172A", fontFamily: "'Sora', sans-serif" }}>
                    Daily Profit
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: "2px" }}>Last 30 days performance</Typography>
                </Box>
                <Box sx={{
                  px: 1.5, py: 0.4, borderRadius: "7px",
                  background: "#F0FDF4", color: "#10B981",
                  fontSize: "0.72rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 0.6,
                }}>
                  <Box sx={{
                    width: 5, height: 5, borderRadius: "50%", background: "#10B981",
                    animation: "pulseDot 1.6s ease-in-out infinite",
                  }} />
                  Live
                </Box>
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
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#FAFBFC" }}>
                  {["Invoice", "Customer", "Date", "Items", "Subtotal", "Tax", "Total"].map(h => (
                    <TableCell key={h} sx={{
                      fontWeight: 600, fontSize: "0.7rem", color: "#94A3B8",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      borderBottom: "1px solid #F1F5F9", py: "12px",
                    }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: "48px" }}>
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
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInvoices.map((inv, i) => (
                    <TableRow key={i} sx={{
                      animation: "rowSlideIn 0.32s ease both",
                      animationDelay: `${0.5 + i * 0.06}s`,
                      transition: "background 0.15s ease",
                      "&:hover": { background: "#F8FAFF" },
                      "&:hover td:first-of-type": { color: "#1D4ED8" },
                      "& td": { borderBottom: "1px solid #F8FAFC" },
                      "&:last-child td": { borderBottom: "none" },
                    }}>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700, fontSize: "0.82rem", color: "#2563EB",
                          fontFamily: "'Sora', sans-serif",
                          transition: "color 0.15s ease",
                        }}>
                          #{inv.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <Avatar sx={{
                            width: 28, height: 28, fontSize: "0.7rem", fontWeight: 700,
                            background: "#EFF6FF", color: "#2563EB",
                            transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                            "tr:hover &": { transform: "scale(1.12)" },
                          }}>
                            {inv.customerName?.[0]?.toUpperCase() ?? "?"}
                          </Avatar>
                          <Typography sx={{ fontSize: "0.845rem", fontWeight: 500, color: "#1E293B" }}>
                            {inv.customerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>{inv.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 24, height: 24, borderRadius: "6px",
                          background: "#EFF6FF", color: "#2563EB",
                          fontSize: "0.72rem", fontWeight: 700,
                          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                          "tr:hover &": { transform: "scale(1.1)" },
                        }}>
                          {inv.items?.length ?? 0}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.845rem", color: "#475569" }}>₹{inv.subtotal}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.845rem", fontWeight: 600, color: "#F59E0B" }}>
                          ₹{inv.tax}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontSize: "0.845rem", fontWeight: 700, color: "#10B981",
                          fontFamily: "'Sora', sans-serif",
                        }}>
                          ₹{inv.total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>

      {/* ── FLOATING AI BUTTON ────────────────────────────────────────────────── */}
      <Box
        onClick={() => setChatOpen(true)}
        sx={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1300,
          cursor: "pointer",
          width: 52, height: 52, borderRadius: "14px",
          background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
          boxShadow: "0 8px 28px rgba(37,99,235,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fabFloat 3.5s ease-in-out infinite, scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.6s both",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
          "&:hover": {
            transform: "scale(1.12) translateY(-3px)",
            boxShadow: "0 16px 40px rgba(37,99,235,0.58)",
            animation: "none",
          },
          "&:active": { transform: "scale(0.94)" },
          "&::after": {
            content: '""', position: "absolute", inset: -4, borderRadius: "18px",
            border: "2px solid rgba(37,99,235,0.28)",
            animation: "ringPulse 2.2s ease-out infinite",
          },
        }}
      >
        <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 22, transition: "transform 0.25s ease" }} />
      </Box>

      <AIChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} businessData={businessData} />
    </Box>
  );
};

export default Dashboard;