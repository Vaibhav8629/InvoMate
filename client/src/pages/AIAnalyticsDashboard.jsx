import React, { useState } from "react";
import {
  Box, Typography, Button, Card, CardContent, Grid,
  CircularProgress, LinearProgress, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  TrendingUp, TrendingDown, LightbulbOutlined, PeopleOutlined, MonetizationOnOutlined,
  Refresh, Psychology, ShowChart, BarChartOutlined, ArrowUpward, ArrowDownward, Remove,
  LocalFireDepartmentOutlined, WarningAmberOutlined, CheckCircleOutlined, SpeedOutlined,
  EmojiObjectsOutlined, TrendingDownOutlined, LocalOfferOutlined, StorageOutlined,
  CalendarMonthOutlined, ShoppingCartOutlined, AssignmentTurnedInOutlined, TrendingUpOutlined,
} from "@mui/icons-material";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line,
} from "recharts";

// ─── Gemini ───────────────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_KEY in .env");
  const makeReq = async (jsonMime) => {
    const gc = { temperature: 0.4 };
    if (jsonMime) gc.responseMimeType = "application/json";
    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: gc }) }
    );
  };
  let res = await makeReq(true);
  if (res.status === 400) res = await makeReq(false);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`Gemini ${res.status}: ${e?.error?.message}`); }
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(clean); }
  catch { throw new Error("Gemini returned invalid JSON"); }
};

const C = {
  blue: "#1B6EF3", blueDark: "#155DD6", blueLight: "#E8F0FE",
  blueMid1: "#E3F2FD", blueMid2: "#90CAF9", blueMid3: "#42A5F5", blueMid4: "#1E88E5", blueDarkMid: "#0D47A1",
  green: "#22C55E", greenLight: "#DCFCE7", greenDark: "#16A34A",
  red: "#EF4444", redLight: "#FEE2E2", redDark: "#DC2626",
  amber: "#F59E0B", amberLight: "#FEF3C7",
  cyan: "#06B6D4", cyanLight: "#CFFAFE",
  bg: "#F5F7FA", paper: "#FFFFFF",
  text: "#0F1C2E", sub: "#5A6A7E", border: "#E4E9F0",
};
const PIE_COLORS = ["#1B6EF3", "#FF6B6B", "#4ECDC4", "#FFD93D", "#6BCB77", "#9D84B7", "#FF8C42", "#2E86AB", "#A23B72", "#F18F01"];

const KpiTile = ({ icon, iconBg, label, value, pct, delay = 0 }) => {
  const up = pct > 0, flat = pct === 0;
  return (
    <Card elevation={0} sx={{ borderRadius: "16px", animation: `fadeUp 0.5s ease ${delay}s both`, "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(18px)" }, to: { opacity: 1, transform: "translateY(0)" } }, transition: "transform 0.2s, box-shadow 0.2s", background: "#fff", border: `1px solid ${C.border}`, "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(15,28,46,0.12)" } }}>
      <CardContent sx={{ p: "22px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</Box>
          <Typography sx={{ color: C.sub, fontWeight: 600, fontSize: "0.80rem", fontFamily: "'DM Sans',sans-serif" }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.6rem", color: C.text, lineHeight: 1.1, mb: 0.75 }}>{value}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.35, color: flat ? C.sub : up ? C.greenDark : C.redDark }}>
          {flat ? <Remove sx={{ fontSize: 13 }}/> : up ? <ArrowUpward sx={{ fontSize: 13 }}/> : <ArrowDownward sx={{ fontSize: 13 }}/>}
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>{flat ? "No change" : `${up ? "+" : ""}${pct}% this week`}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const Skel = ({ h = 120 }) => (
  <Box sx={{ borderRadius: "12px", background: C.bg, height: h, overflow: "hidden" }}>
    <LinearProgress sx={{ "& .MuiLinearProgress-bar": { background: `linear-gradient(90deg,${C.border},${C.blueLight},${C.border})` } }}/>
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════════
export default function AIAnalyticsDashboard() {
  const [loading, setLoading] = useState(false);
  const [ai, setAi] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("");

  const run = async () => {
    setLoading(true); setError(null); setAi(null);
    try {
      const token = localStorage.getItem("token");
      setStage("Fetching business data…");
      const res = await fetch("http://localhost:5000/api/ai/dashboard-analytics", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Backend ${res.status}`);
      const data = await res.json();

      setStage("Gemini is analyzing your business…");
      const prompt = `
You are a business analyst AI for InvoMate. Analyze the data below and return ONLY valid JSON with NO markdown fences, NO explanation.
Data: ${JSON.stringify(data)}

Return exactly this shape:
{
  "kpis": { "totalRevenue": 512000, "revenueGrowthPct": 12, "totalOrders": 3420, "ordersGrowthPct": 8, "totalCustomers": 890, "customersGrowthPct": 5, "avgOrderValue": 1490, "avgOrderGrowthPct": -3, "profitMarginPct": 34 },
  "businessInsights": [{ "text": "insight text", "trend": "up" }],
  "salesPrediction": {
    "summary": "paragraph", "growthPercent": 9, "points": ["p1","p2","p3"],
    "trendData": [
      {"week":"W1","actual":48000,"predicted":null},{"week":"W2","actual":52000,"predicted":null},
      {"week":"W3","actual":55000,"predicted":null},{"week":"W4","actual":51000,"predicted":null},
      {"week":"W5","actual":null,"predicted":57000},{"week":"W6","actual":null,"predicted":61000}
    ]
  },
  "stockSuggestions": [{"product":"Name","daysLeft":8,"action":"restock","quantity":120,"reason":"brief"}],
  "productAnalysis": {
    "topProducts": [{"name":"P","sold":340,"revenue":85000,"score":88,"reason":"why"}],
    "lowProducts":  [{"name":"P","sold":45,"revenue":9000,"score":28,"issue":"what","suggestion":"fix"}]
  },
  "customerHeatmap": [
    {"day":"Mon","morning":12,"afternoon":28,"evening":18,"night":5},
    {"day":"Tue","morning":9,"afternoon":32,"evening":21,"night":4},
    {"day":"Wed","morning":14,"afternoon":25,"evening":17,"night":6},
    {"day":"Thu","morning":11,"afternoon":30,"evening":24,"night":4},
    {"day":"Fri","morning":19,"afternoon":38,"evening":31,"night":11},
    {"day":"Sat","morning":22,"afternoon":42,"evening":24,"night":16},
    {"day":"Sun","morning":15,"afternoon":20,"evening":13,"night":9}
  ],
  "profitOptimization": [{"idea":"suggestion","impact":"high","category":"pricing"}],
  "profitContribution": [{"product":"Product A","profit":35000,"percentage":35}]
}
Rules: businessInsights >= 7. profitOptimization >= 5. Use real data.`;

      const result = await callGemini(prompt);
      setAi(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false); setStage("");
    }
  };

  // ── EMPTY ────────────────────────────────────────────────────────────────────
  if (!ai && !loading) return (
    <Box sx={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Box sx={{ textAlign: "center", maxWidth: 440 }}>
        <Box sx={{ width: 84, height: 84, borderRadius: "22px", background: `linear-gradient(135deg,${C.blue},${C.blueMid4})`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, boxShadow: `0 16px 40px ${C.blue}40`, animation: "float 3s ease-in-out infinite", "@keyframes float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } } }}>
          <Psychology sx={{ fontSize: 42, color: "#fff" }}/>
        </Box>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.7rem", color: C.text, mb: 1.5 }}>AI Business Intelligence</Typography>
        <Typography variant="body1" sx={{ color: C.sub, mb: 3.5, lineHeight: 1.7 }}>
          Deep insights, sales forecasts, stock alerts and profit opportunities — all powered by Gemini 2.5 Flash.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 4 }}>
          {["Insights","Sales Forecast","Stock Alerts","Customer Heatmap","Profit Analysis"].map(f => (
            <Box key={f} component="span" sx={{ px: 1.25, py: 0.4, borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, background: C.blueLight, color: C.blue, fontFamily: "'DM Sans',sans-serif" }}>{f}</Box>
          ))}
        </Box>
        {error && <Box sx={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: "10px", p: 2, mb: 3 }}>
          <Typography variant="body2" sx={{ color: C.redDark, fontWeight: 500 }}>⚠ {error}</Typography>
        </Box>}
        <Button variant="contained" size="large" onClick={run} startIcon={<Psychology/>} sx={{ background: `linear-gradient(135deg,${C.blue},${C.blueDark})`, boxShadow: `0 8px 24px ${C.blue}40`, px: 4, py: 1.5, borderRadius: "12px", fontSize: "0.93rem", "&:hover": { background: `linear-gradient(135deg,${C.blueDark},#1048B8)`, boxShadow: `0 12px 32px ${C.blue}50`, transform: "translateY(-1px)" }, transition: "all 0.2s" }}>
          Run AI Analysis
        </Button>
      </Box>
    </Box>
  );

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ textAlign: "center" }}>
        <Box sx={{ position: "relative", width: 72, height: 72, mx: "auto", mb: 2.5 }}>
          <CircularProgress size={72} thickness={2.5} sx={{ color: C.blue, position: "absolute" }}/>
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Psychology sx={{ fontSize: 30, color: C.blue }}/>
          </Box>
        </Box>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: C.text, mb: 0.75 }}>Gemini is thinking…</Typography>
        <Typography variant="body2" sx={{ color: C.sub, mb: 2.5 }}>{stage}</Typography>
        <LinearProgress sx={{ width: 260, mx: "auto", borderRadius: 99, height: 4, background: C.border, "& .MuiLinearProgress-bar": { background: `linear-gradient(90deg,${C.blue},${C.blueMid4})`, borderRadius: 99 } }}/>
      </Box>
    </Box>
  );

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  const kpi = ai.kpis || {};

  // Helper function to calculate daily total for heatmap
  const calculateDailyTotal = (day) => {
    const slots = ["morning", "afternoon", "evening", "night"];
    const dayData = ai.customerHeatmap?.find(d => d.day === day);
    if (!dayData) return 0;
    return slots.reduce((sum, slot) => sum + (dayData[slot] || 0), 0);
  };

  // Get max value for daily heatmap intensity
  const dailyMax = ai.customerHeatmap ? Math.max(...ai.customerHeatmap.map(d => calculateDailyTotal(d.day)), 1) : 1;

  return (
    <Box sx={{ background: C.bg, minHeight: "100vh", p: { xs: 2, md: "28px 32px" } }}>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "32px", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.8rem", color: C.text, lineHeight: 1.1 }}>AI Analytics</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 1.8s ease-in-out infinite", "@keyframes pulse": { "0%,100%": { opacity: 1, transform: "scale(1)" }, "50%": { opacity: 0.4, transform: "scale(1.4)" } } }}/>
            <Typography variant="caption" sx={{ color: C.sub, fontWeight: 600 }}>Powered by Gemini 2.5 Flash</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<Refresh/>} onClick={run} sx={{ borderColor: C.border, color: C.text, fontWeight: 600, borderRadius: "12px", px: 2.5, py: 1, "&:hover": { borderColor: C.blue, color: C.blue, background: C.blueLight } }}>
          Refresh Analysis
        </Button>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: KPI SUMMARY CARDS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Grid container spacing={2.5} sx={{ mb: "32px" }}>
        {[
          { label: "Total Revenue",   value: `₹${(kpi.totalRevenue||0).toLocaleString()}`,   pct: kpi.revenueGrowthPct||0,   iconBg: `${C.blue}16`,   icon: <MonetizationOnOutlined sx={{ fontSize: 20, color: C.blue }}/> },
          { label: "Total Orders",    value: (kpi.totalOrders||0).toLocaleString(),            pct: kpi.ordersGrowthPct||0,    iconBg: `${C.blueMid4}16`, icon: <ShoppingCartOutlined sx={{ fontSize: 20, color: C.blueMid4 }}/> },
          { label: "Total Customers", value: (kpi.totalCustomers||0).toLocaleString(),         pct: kpi.customersGrowthPct||0, iconBg: `${C.cyan}16`,   icon: <PeopleOutlined sx={{ fontSize: 20, color: C.cyan }}/> },
          { label: "Avg Order Value", value: `₹${(kpi.avgOrderValue||0).toLocaleString()}`,   pct: kpi.avgOrderGrowthPct||0,  iconBg: `${C.amber}16`,  icon: <TrendingDownOutlined sx={{ fontSize: 20, color: C.amber }}/> },
        ].map((t, i) => (
          <Grid item xs={6} sm={6} md={3} lg={3} key={i}><KpiTile {...t} delay={i * 0.06}/></Grid>
        ))}
      </Grid>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: BUSINESS INSIGHTS + SALES PREDICTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Grid container spacing={2.5} sx={{ mb: "32px" }}>
        {/* Business Insights - Vertical Timeline */}
        <Grid item xs={12} lg={5}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}`, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 8px 32px rgba(15,28,46,0.08)" } }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <EmojiObjectsOutlined sx={{ fontSize: 24, color: C.amber }}/>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Business Insights</Typography>
              </Box>
              {ai.businessInsights ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {(ai.businessInsights||[]).slice(0, 6).map((it, i) => {
                    const cfg = it.trend === "up"
                      ? { bg: C.greenLight, border: `${C.green}28`, icon: <TrendingUp sx={{ fontSize: 16, color: C.greenDark }}/>, dot: C.green }
                      : it.trend === "down"
                      ? { bg: C.redLight, border: `${C.red}28`, icon: <TrendingDown sx={{ fontSize: 16, color: C.redDark }}/>, dot: C.red }
                      : { bg: C.blueLight, border: `${C.blue}28`, icon: <LightbulbOutlined sx={{ fontSize: 16, color: C.blue }}/>, dot: C.blue };
                    return (
                      <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: "14px 16px", borderRadius: "12px", background: cfg.bg, border: `1px solid ${cfg.border}`, transition: "all 0.2s", "&:hover": { transform: "translateX(6px)", boxShadow: "0 4px 16px rgba(15,28,46,0.06)" } }}>
                        <Box sx={{ minWidth: 28, height: 28, borderRadius: "8px", background: `${cfg.dot}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.2 }}>
                          {cfg.icon}
                        </Box>
                        <Typography variant="body2" sx={{ color: C.text, lineHeight: 1.6, fontWeight: 500 }}>{it.text}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : <Skel h={300}/>}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Prediction Chart */}
        <Grid item xs={12} lg={7}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}`, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 8px 32px rgba(15,28,46,0.08)" } }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShowChart sx={{ fontSize: 24, color: C.blue }}/>
                  <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Sales Forecast</Typography>
                </Box>
                {ai.salesPrediction && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.75, py: 0.6, borderRadius: "10px", background: C.greenLight, border: `1px solid ${C.green}30` }}>
                    <TrendingUp sx={{ fontSize: 16, color: C.greenDark }}/>
                    <Typography sx={{ fontSize: "0.80rem", fontWeight: 700, color: C.greenDark }}>+{ai.salesPrediction?.growthPercent||0}%</Typography>
                  </Box>
                )}
              </Box>
              {ai.salesPrediction ? (
                <>
                  <Box sx={{ height: 180, mb: 2.5 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ai.salesPrediction?.trendData||[]} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.25}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blueMid4} stopOpacity={0.25}/><stop offset="95%" stopColor={C.blueMid4} stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: C.sub, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 10, fill: C.sub, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} width={35}/>
                        <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: "'DM Sans'", fontSize: 12, background: "#fff" }}/>
                        <Area type="monotone" dataKey="actual" stroke={C.blue} strokeWidth={2.5} fill="url(#g1)" name="Actual" dot={{ fill: C.blue, r: 4, strokeWidth: 2 }} connectNulls={false}/>
                        <Area type="monotone" dataKey="predicted" stroke={C.blueMid4} strokeWidth={2.5} fill="url(#g2)" name="Predicted" dot={{ fill: C.blueMid4, r: 4, strokeWidth: 2 }} strokeDasharray="5 4" connectNulls={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="body2" sx={{ color: C.sub, lineHeight: 1.7, mb: 2, fontSize: "0.85rem" }}>{ai.salesPrediction.summary}</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {(ai.salesPrediction.points||[]).slice(0, 3).map((p, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                        <Box sx={{ minWidth: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.blueMid4})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.1 }}>
                          <Typography sx={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>{i+1}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: C.text, lineHeight: 1.5, fontWeight: 500 }}>{p}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : <Skel h={320}/>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: STOCK REPLENISHMENT TABLE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Card elevation={0} sx={{ borderRadius: "18px", mb: "32px", background: "#fff", border: `1px solid ${C.border}` }}>
        <CardContent sx={{ p: "28px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <StorageOutlined sx={{ fontSize: 24, color: C.red }}/>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Stock Replenishment</Typography>
          </Box>
          {ai.stockSuggestions ? (
            <TableContainer>
              <Table sx={{ "& .MuiTableCell-root": { borderColor: C.border, paddingY: 1.5 } }}>
                <TableHead>
                  <TableRow sx={{ background: C.bg }}>
                    <TableCell sx={{ fontWeight: 700, color: C.sub, fontSize: "0.85rem", textTransform: "uppercase" }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: C.sub, fontSize: "0.85rem", textTransform: "uppercase" }}>Days Left</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: C.sub, fontSize: "0.85rem", textTransform: "uppercase" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: C.sub, fontSize: "0.85rem", textTransform: "uppercase" }}>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(ai.stockSuggestions||[]).map((s, i) => {
                    const isR = s.action === "restock", isW = s.action === "watch";
                    const col = isR ? C.red : isW ? C.amber : C.green;
                    const statusLabel = isR ? "⚠ Restock Needed" : isW ? "👁 Watch" : "✓ Good";
                    const pct = Math.min(((s.daysLeft||0)/30)*100, 100);
                    return (
                      <TableRow key={i} sx={{ "&:hover": { background: C.bg } }}>
                        <TableCell sx={{ color: C.text, fontWeight: 600 }}>{s.product}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: "6px", background: `${col}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ color: col, fontWeight: 800, fontSize: "0.80rem" }}>{s.daysLeft}d</Typography>
                            </Box>
                            <Box sx={{ width: 60, height: 4, borderRadius: 99, background: `${col}18` }}>
                              <Box sx={{ height: "100%", borderRadius: 99, background: col, width: `${pct}%` }}/>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "inline-block", px: 1.25, py: 0.5, borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, background: `${col}15`, color: col }}>
                            {statusLabel}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ color: C.text, fontWeight: 700 }}>{s.quantity || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Skel h={260}/>}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: DAILY HEATMAP + PROFIT CONTRIBUTION BAR CHART */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ display: "flex", gap: 2.5, mb: "32px" }}>
        {/* Monthly Activity Heatmap */}
        <Box sx={{ flex: '0 0 35%' }}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}` }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <CalendarMonthOutlined sx={{ fontSize: 24, color: C.blueMid4 }}/>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Daily Activity Heat</Typography>
              </Box>
              {ai.customerHeatmap ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, justifyContent: "flex-start" }}>
                    <Typography variant="caption" sx={{ color: C.sub, fontWeight: 600, fontSize: "0.76rem" }}>Low</Typography>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
                      <Box key={i} sx={{ width: 18, height: 18, borderRadius: "6px", background: `linear-gradient(135deg, ${C.blueMid1}, ${C.blueMid4})`, opacity: v }}/>
                    ))}
                    <Typography variant="caption" sx={{ color: C.sub, fontWeight: 600, fontSize: "0.76rem" }}>High</Typography>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.8 }}>
                    {Array.from({ length: 30 }).map((_, dayIndex) => {
                      const dayNum = dayIndex + 1;
                      const weekDay = dayIndex % 7;
                      const backendDay = ai.customerHeatmap[weekDay];
                      const total = backendDay ? calculateDailyTotal(backendDay.day) : 0;
                      const intensity = dailyMax > 0 ? total / dailyMax : 0;
                      const bgColor = `rgba(30, 136, 229, ${0.15 + intensity * 0.85})`;
                      return (
                        <Tooltip key={dayNum} title={`Day ${dayNum}: ${total} customers`} arrow>
                          <Box sx={{
                            p: "8px 4px",
                            borderRadius: "10px",
                            background: bgColor,
                            border: `1.5px solid ${C.blueMid4}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "65px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.08)",
                              boxShadow: `0 6px 16px rgba(30, 136, 229, 0.25)`,
                              borderColor: C.blueMid4,
                            }
                          }}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: C.sub, mb: 0.3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Day {dayNum}
                            </Typography>
                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: C.text }}>
                              {total}
                            </Typography>
                            <Typography sx={{ fontSize: "0.60rem", color: C.sub, fontWeight: 600, mt: 0.2 }}>
                              {total === 1 ? "person" : "people"}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </>
              ) : <Skel h={350}/>}
            </CardContent>
          </Card>
        </Box>

        {/* Profit Contribution - BAR CHART */}
        <Box sx={{ flex: '0 0 65%' }}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}` }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <BarChartOutlined sx={{ fontSize: 24, color: C.blueMid4 }}/>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Profit by Product</Typography>
              </Box>
              {ai.profitContribution ? (
                <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ai.profitContribution} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                      <XAxis dataKey="product" tick={{ fontSize: 11, fill: C.sub, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={100}/>
                      <YAxis tick={{ fontSize: 10, fill: C.sub, fontFamily: "'DM Sans'" }} axisLine={false} tickLine={false} width={50}/>
                      <RTooltip 
                        formatter={(value) => `₹${value?.toLocaleString()}`}
                        contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: "'DM Sans'", fontSize: 12, background: "#fff" }}
                      />
                      <Bar dataKey="profit" fill={C.blue} radius={[8, 8, 0, 0]}>
                        {(ai.profitContribution||[]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : <Skel h={350}/>}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: PROFIT OPTIMIZATION RECOMMENDATIONS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Card elevation={0} sx={{ borderRadius: "18px", mb: "32px", background: "#fff", border: `1px solid ${C.border}` }}>
        <CardContent sx={{ p: "28px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <AssignmentTurnedInOutlined sx={{ fontSize: 24, color: C.green }}/>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Optimization Ideas</Typography>
          </Box>
          {ai.profitOptimization ? (
            <Grid container spacing={1.5}>
              {(ai.profitOptimization||[]).slice(0, 5).map((it, i) => {
                const impactColor = { high: C.green, medium: C.amber, low: C.blue };
                const impactBg = { high: C.greenLight, medium: C.amberLight, low: C.blueLight };
                const Icon = it.impact === "high" ? LocalFireDepartmentOutlined : it.impact === "medium" ? WarningAmberOutlined : CheckCircleOutlined;
                return (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ p: "16px 18px", borderRadius: "14px", background: impactBg[it.impact]||C.blueLight, border: `1px solid ${impactColor[it.impact]||C.blue}22`, borderLeft: `4px solid ${impactColor[it.impact]||C.blue}`, transition: "all 0.2s", "&:hover": { transform: "translateX(6px)", boxShadow: "0 6px 20px rgba(15,28,46,0.08)" } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1 }}>
                        <Box sx={{ minWidth: 28, height: 28, borderRadius: "8px", background: `${impactColor[it.impact]}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.2 }}>
                          <Icon sx={{ fontSize: 16, color: impactColor[it.impact] }}/>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: C.text }}>{it.idea}</Typography>
                            <Box component="span" sx={{ px: 1, py: 0.3, borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800, background: impactColor[it.impact], color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                              {it.impact}
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: "0.75rem", color: C.sub, mt: 0.5, textTransform: "uppercase", letterSpacing: "0.02em", fontWeight: 600 }}>
                            {it.category}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : <Skel h={320}/>}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: TOP PRODUCTS + PRODUCT ALERTS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Grid container spacing={2.5} sx={{ mb: "32px" }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}` }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <TrendingUpOutlined sx={{ fontSize: 24, color: C.green }}/>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Top Performing Products</Typography>
              </Box>
              {ai.productAnalysis ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {(ai.productAnalysis.topProducts||[]).slice(0, 4).map((p, i) => (
                    <Box key={i} sx={{ p: "16px 18px", borderRadius: "14px", background: C.greenLight, border: `1px solid ${C.green}20`, transition: "all 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(34,197,94,0.15)" } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: C.text, mb: 0.3 }}>{p.name}</Typography>
                          <Typography sx={{ fontSize: "0.78rem", color: C.sub, lineHeight: 1.5 }}>{p.reason}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 50, textAlign: "right" }}>
                          <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: C.greenDark }}>★ {p.score}%</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 1, fontSize: "0.75rem", color: C.sub, fontWeight: 600 }}>
                        <Box>📊 {(p.sold||0).toLocaleString()} sold</Box>
                        <Box>💰 ₹{(p.revenue||0).toLocaleString()}</Box>
                      </Box>
                      <LinearProgress variant="determinate" value={p.score} sx={{ height: 6, borderRadius: 99, mt: 1.25, background: `${C.green}20`, "& .MuiLinearProgress-bar": { background: C.greenDark, borderRadius: 99 } }}/>
                    </Box>
                  ))}
                </Box>
              ) : <Skel h={280}/>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: "18px", height: "100%", background: "#fff", border: `1px solid ${C.border}` }}>
            <CardContent sx={{ p: "28px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <WarningAmberOutlined sx={{ fontSize: 24, color: C.red }}/>
                <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.15rem", color: C.text, letterSpacing: "-0.01em" }}>Products Needing Attention</Typography>
              </Box>
              {ai.productAnalysis ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {(ai.productAnalysis.lowProducts||[]).slice(0, 4).map((p, i) => (
                    <Box key={i} sx={{ p: "16px 18px", borderRadius: "14px", background: C.redLight, border: `1px solid ${C.red}20`, transition: "all 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(239,68,68,0.15)" } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: C.text, mb: 0.3 }}>{p.name}</Typography>
                          <Typography sx={{ fontSize: "0.78rem", color: C.sub, mb: 0.5 }}>⚠ {p.issue}</Typography>
                          <Typography sx={{ fontSize: "0.76rem", color: C.redDark, fontWeight: 500 }}>💡 {p.suggestion}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 42, textAlign: "right" }}>
                          <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: C.redDark }}>⚠ {p.score}%</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 1, fontSize: "0.75rem", color: C.sub, fontWeight: 600 }}>
                        <Box>📉 {(p.sold||0).toLocaleString()} sold</Box>
                        <Box>💸 ₹{(p.revenue||0).toLocaleString()}</Box>
                      </Box>
                      <LinearProgress variant="determinate" value={100 - p.score} sx={{ height: 6, borderRadius: 99, mt: 1.25, background: `${C.red}20`, "& .MuiLinearProgress-bar": { background: C.red, borderRadius: 99 } }}/>
                    </Box>
                  ))}
                </Box>
              ) : <Skel h={280}/>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ textAlign: "center", pb: 4, pt: 2 }}>
        <Typography variant="caption" sx={{ color: "#A3B0BF", fontWeight: 500, fontSize: "0.82rem" }}>
          ✨ Advanced analytics powered by Gemini 2.5 Flash · InvoMate AI Engine
        </Typography>
      </Box>
    </Box>
  );
}