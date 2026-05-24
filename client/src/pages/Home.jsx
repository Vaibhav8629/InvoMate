import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";

/* ─── Manual CSS injected once ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base:        #0d0d14;
    --bg-sidebar:     #111118;
    --bg-card:        #16161f;
    --bg-card-hover:  #1c1c28;
    --bg-topbar:      #111118;
    --border:         rgba(255,255,255,0.07);
    --border-active:  rgba(255,255,255,0.13);
    --accent:         #7c5cfc;
    --accent-soft:    rgba(124,92,252,0.18);
    --accent-btn:     #8b6bfd;
    --green:          #00e5a0;
    --green-soft:     rgba(0,229,160,0.15);
    --red:            #ff5a65;
    --red-soft:       rgba(255,90,101,0.18);
    --cyan:           #22d3ee;
    --cyan-soft:      rgba(34,211,238,0.15);
    --text-primary:   #f0f0f8;
    --text-secondary: #8888a4;
    --text-muted:     #55556a;
    --chart-stroke:   #9b7eff;
    --chart-fill-top: rgba(124,92,252,0.35);
    --chart-fill-bot: rgba(124,92,252,0.00);
  }

  body { background: var(--bg-base); font-family: 'DM Sans', sans-serif; color: var(--text-primary); }

  /* sidebar */
  .sidebar {
    width: 172px; min-height: 100vh;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 0 0 20px 0;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 20;
  }
  .sidebar-logo {
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-text { font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }
  .logo-sub  { font-size: 9px; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; }

  .create-btn {
    margin: 14px 12px;
    background: var(--bg-card);
    border: 1px dashed var(--border-active);
    border-radius: 10px;
    padding: 10px 8px;
    display: flex; flex-direction: column; align-items: center;
    cursor: pointer; transition: background .2s;
    color: var(--text-secondary); font-size: 12px; font-weight: 500; gap: 4px;
  }
  .create-btn:hover { background: var(--bg-card-hover); }
  .create-btn .plus { font-size: 22px; color: var(--text-muted); line-height: 1; }

  .nav-section { flex: 1; padding: 6px 8px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 9px;
    font-size: 13px; font-weight: 500; color: var(--text-secondary);
    cursor: pointer; transition: all .15s; margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
  .nav-item.active { background: var(--accent-soft); color: var(--text-primary); }
  .nav-item.active svg { color: var(--accent); }

  .sidebar-footer {
    padding: 12px 12px 0;
    border-top: 1px solid var(--border);
  }
  .help-row {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--text-muted);
    padding: 8px 4px; cursor: pointer;
  }
  .user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 4px; margin-top: 4px;
  }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg,#7c5cfc,#4f3bc0);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .user-name { font-size: 12px; font-weight: 600; }
  .user-plan { font-size: 10px; color: var(--accent); letter-spacing: .5px; text-transform: uppercase; }

  /* topbar */
  .topbar {
    position: fixed; top: 0; left: 172px; right: 0; height: 52px;
    background: var(--bg-topbar);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; z-index: 15;
  }
  .search-wrap {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 14px; width: 240px;
  }
  .search-wrap input {
    background: transparent; border: none; outline: none;
    color: var(--text-secondary); font-size: 12px; font-family: inherit; width: 100%;
  }
  .topbar-tabs { display: flex; align-items: center; gap: 4px; }
  .tab {
    padding: 6px 14px; font-size: 13px; font-weight: 500;
    color: var(--text-secondary); cursor: pointer; border-radius: 8px;
    position: relative; transition: color .15s;
  }
  .tab.active { color: var(--text-primary); }
  .tab.active::after {
    content: ''; position: absolute; bottom: -14px; left: 0; right: 0;
    height: 2px; background: var(--text-primary); border-radius: 2px;
  }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--bg-card); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-secondary); font-size: 16px; transition: all .15s;
  }
  .icon-btn:hover { border-color: var(--border-active); color: var(--text-primary); }
  .upgrade-btn {
    background: var(--accent-btn); color: #fff;
    border: none; border-radius: 8px; padding: 7px 16px;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: opacity .15s;
  }
  .upgrade-btn:hover { opacity: .88; }

  /* main */
  .main { margin-left: 172px; padding-top: 52px; min-height: 100vh; }
  .content { padding: 28px 28px 40px; }

  /* stat cards */
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 6px;
    transition: border-color .2s;
  }
  .stat-card:hover { border-color: var(--border-active); }
  .stat-label { font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); }
  .stat-icon { font-size: 15px; }
  .stat-value { font-size: 26px; font-weight: 700; line-height: 1.1; font-family: 'JetBrains Mono', monospace; }
  .stat-value.green { color: var(--green); }
  .stat-sub { font-size: 10px; color: var(--text-muted); }
  .stat-sub.positive { color: var(--green); }

  /* chart card */
  .chart-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 22px 22px 14px;
  }
  .live-badge {
    background: rgba(0,229,160,0.12);
    color: var(--green); font-size: 9px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 8px; border-radius: 20px;
    border: 1px solid rgba(0,229,160,0.2);
    display: flex; align-items: center; gap: 4px;
  }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: blink 1.4s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* chart area */
  .chart-svg { width: 100%; height: 200px; display: block; overflow: visible; }

  /* inventory */
  .inv-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 20px 20px 16px;
  }
  .inv-row { padding: 10px 0; border-bottom: 1px solid var(--border); }
  .inv-row:last-child { border-bottom: none; }
  .inv-name { font-size: 13px; font-weight: 500; }
  .inv-count { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
  .inv-bar-track { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.07); margin-top: 8px; }
  .inv-bar-fill  { height: 3px; border-radius: 2px; }

  /* manage link */
  .manage-link { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); cursor: pointer; }
  .manage-link:hover { color: var(--text-secondary); }

  /* date chip */
  .date-chip {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 5px 12px;
    font-size: 12px; color: var(--text-secondary);
    display: flex; align-items: center; gap: 6px;
  }

  /* Recent Transactions Table */
  .rt-wrap {
    background: #0f0f14;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 24px 28px 16px;
    font-family: 'DM Sans', sans-serif;
    color: #f0f0f8;
    margin-top: 20px;
  }
  .rt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .rt-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: #ffffff;
  }
  .rt-header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .rt-filter-icon {
    display: flex;
    flex-direction: column;
    gap: 3px;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.2s;
  }
  .rt-filter-icon:hover {
    opacity: 0.7;
  }
  .rt-filter-icon span {
    display: block;
    height: 2px;
    background: #f0f0f8;
    border-radius: 2px;
  }
  .rt-filter-icon span:nth-child(1) { width: 16px; }
  .rt-filter-icon span:nth-child(2) { width: 11px; }
  .rt-view-all {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #8b6bfd;
    cursor: pointer;
    transition: opacity .2s;
  }
  .rt-view-all:hover { opacity: .8; }
  .rt-col-headers {
    display: grid;
    grid-template-columns: 140px 200px 120px 80px 140px 140px 1fr;
    padding: 0 20px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    margin-bottom: 4px;
  }
  .rt-col-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #4a4a5e;
  }
  .rt-col-label.right { text-align: right; }
  .rt-row {
    display: grid;
    grid-template-columns: 140px 200px 120px 80px 140px 140px 1fr;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: background .2s;
    border-radius: 10px;
    cursor: pointer;
  }
  .rt-row:last-child { border-bottom: none; }
  .rt-row:hover { background: rgba(255,255,255,0.02); }
  .rt-invoice {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e8;
    letter-spacing: -0.3px;
  }
  .rt-customer {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .rt-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
  }
  .rt-customer-name {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
  .rt-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }
  .rt-badge.paid {
    background: rgba(0,229,160,0.15);
    color: #00e5a0;
    border: 1px solid rgba(0,229,160,0.25);
  }
  .rt-badge.pending {
    background: rgba(251,146,60,0.15);
    color: #fb923c;
    border: 1px solid rgba(251,146,60,0.25);
  }
  .rt-items {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #7a7a8e;
    font-weight: 500;
  }
  .rt-total {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e8;
  }
  .rt-mode {
    font-size: 12px;
    color: #5a5a6e;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 500;
  }
  .rt-profit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    font-weight: 700;
    color: #00e5a0;
    text-align: right;
  }
`;

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  grid:    "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  file:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  bar:     "M18 20V10M12 20V4M6 20v-6",
  credit:  "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zM2 12h20",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  help:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  search:  "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  cal:     "M3 4h18M3 20h18M8 4v16M16 4v16M3 8h5M3 12h5M3 16h5M16 8h5M16 12h5M16 16h5",
};

/* ─── Chart ──────────────────────────────────────────────────────────────── */
function ProfitChart({ invoices }) {
  // Calculate last 7 days profit data from invoices
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return { label: dayName, date: `${day}-${month}-${year}` };
  });

  const pts = last7Days.map((day) => {
    const dayInvoices = invoices.filter((inv) => inv.date === day.date);
    const profit = dayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
    return profit / 100; // Scale down for visualization
  });

  const W = 460, H = 170, PAD = 8;
  const minY = Math.min(...pts, 0), maxY = Math.max(...pts, 1);
  const xs = pts.map((_, i) => PAD + (i / (pts.length - 1)) * (W - PAD * 2));
  const ys = pts.map(v => H - PAD - ((v - minY) / (maxY - minY || 1)) * (H - PAD * 2));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`;
  const days = last7Days.map(d => d.label);

  return (
    <div style={{ position: "relative" }}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H + 28}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-fill-top)" />
            <stop offset="100%" stopColor="var(--chart-fill-bot)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* grid lines */}
        {[0.25,0.5,0.75].map((r,i)=>(
          <line key={i} x1={PAD} x2={W-PAD} y1={H * r} y2={H * r}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {/* area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* line */}
        <path d={linePath} fill="none" stroke="var(--chart-stroke)" strokeWidth="2"
          filter="url(#glow)" strokeLinejoin="round" strokeLinecap="round" />
        {/* last point dot */}
        {pts.length > 0 && <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4"
          fill="var(--chart-stroke)" filter="url(#glow)" />}
        {/* day labels evenly spread */}
        {days.map((d,i) => {
          const x = PAD + (i / (days.length - 1)) * (W - PAD * 2);
          return (
            <text key={d} x={x} y={H + 20} textAnchor="middle"
              fontSize="9" fill="var(--text-muted)" fontFamily="DM Sans"
              letterSpacing="0.5">{d}</text>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Inventory bar ──────────────────────────────────────────────────────── */
function InvRow({ name, count, total, color }) {
  const pct = Math.min(100, (count / total) * 100);
  return (
    <div className="inv-row">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="inv-name">{name}</span>
        <span className="inv-count">{count} Left</span>
      </div>
      <div className="inv-bar-track">
        <div className="inv-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, valueClass = "" }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="stat-label">{label}</span>
        <span className="stat-icon" style={{ color: "var(--text-muted)" }}>{icon}</span>
      </div>
      <div className={`stat-value ${valueClass}`}>{value}</div>
      {sub && <div className={`stat-sub ${sub.startsWith("+") ? "positive" : ""}`}>{sub}</div>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  
  // State for backend data
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState("Elite Workspace");
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices
        const invRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/getinvoices`, {
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });
        const invData = await invRes.json();
        setInvoices(Array.isArray(invData) ? invData : []);

        // Fetch products
        const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/getproducts`, {
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);

        // Fetch profile
        const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/findprofile`, {
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });
        const profData = await profRes.json();
        setShopName(profData.ShopName || "Elite Workspace");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics from backend data
  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  
  const todayInvoices = invoices.filter(inv => inv.date === formattedToday);
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const todayProfit = todayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const lowStockProducts = products.filter(p => Number(p.Stock) <= 5);

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

  useEffect(() => {
    const tag = document.createElement("style");
    tag.setAttribute("data-home-styles", "true");
    tag.textContent = STYLES;
    document.head.appendChild(tag);

    return () => {
      tag.remove();
    };
  }, []);

  const tabs = ["Overview", "Reports", "History"];

  // Prepare inventory data from products
  const inventory = lowStockProducts.slice(0, 5).map(p => ({
    name: p.item,
    count: Number(p.Stock),
    total: 50, // You can adjust this based on your needs
    color: Number(p.Stock) === 0 ? "var(--red)" : Number(p.Stock) <= 2 ? "var(--red)" : Number(p.Stock) <= 5 ? "var(--accent)" : "var(--cyan)"
  }));

  // If no low stock, show message
  if (inventory.length === 0) {
    inventory.push({
      name: "All products well-stocked ✓",
      count: 100,
      total: 100,
      color: "var(--green)"
    });
  }

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };


  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>Loading...</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Fetching your data</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar shopName={shopName} onLogout={handleLogout} />

      {/* ── Topbar ──────────────────────────────────────────────────── */}
      <header className="topbar" style={{ left: SIDEBAR_WIDTH }}>
        {/* Search */}
        <div className="search-wrap">
          <Icon d={ICONS.search} size={13} color="var(--text-muted)" />
          <input placeholder="Search invoices, clients..." />
        </div>

        {/* Tabs */}
        <div className="topbar-tabs">
          {tabs.map(t => (
            <div
              key={t}
              className={`tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >{t}</div>
          ))}
        </div>

        {/* Right actions */}
        <div className="topbar-right">
          <div className="icon-btn"><Icon d={ICONS.bell} size={15} /></div>
          <div className="icon-btn"><Icon d={ICONS.moon} size={15} /></div>
          <button className="upgrade-btn">Upgrade Plan</button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="main" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div className="content">

          {/* Greeting row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
                Good day, {shopName} 👋
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Here is what's happening with your workspace today.
              </p>
            </div>
            <div className="date-chip">
              <Icon d={ICONS.cal} size={13} color="var(--text-muted)" />
              {today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {/* Stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
            <StatCard
              label="Total Invoices"
              value={invoices.length.toLocaleString()}
              sub={`+${todayInvoices.length} today`}
              icon={<Icon d={ICONS.file} size={15} />}
            />
            <StatCard
              label="Today's Profit"
              value={`₹${todayProfit.toLocaleString("en-IN")}`}
              sub={`${changeVsYest >= 0 ? '+' : ''}${changeVsYest}% vs yesterday`}
              icon={<span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />}
              valueClass="green"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${totalRevenue.toLocaleString("en-IN")}`}
              sub=""
              icon={<Icon d={ICONS.credit} size={15} />}
              valueClass="green"
            />
            <StatCard
              label="Today's Bills"
              value={todayInvoices.length.toString()}
              sub={`Total: ₹${todayRevenue.toLocaleString("en-IN")}`}
              icon={<Icon d={ICONS.file} size={15} />}
            />
            <StatCard
              label="Total Products"
              value={products.length.toString()}
              sub={`${lowStockProducts.length} low stock items`}
              icon={<Icon d={ICONS.bar} size={15} />}
            />
          </div>

          {/* Bottom two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

            {/* Chart card */}
            <div className="chart-card">
              {/* Chart header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>Daily Profit Analytics</span>
                    <span className="live-badge">
                      <span className="live-dot" />
                      Live Updates
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Net profit trends for current billing cycle
                  </p>
                </div>
                <div style={{ display: "flex", gap: 20, textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>Total Week</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>₹{totalWeekProfit.toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>Daily Avg</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>₹{Math.round(avgProfit).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>

              <ProfitChart invoices={invoices} />
            </div>

            {/* Inventory card */}
            <div className="inv-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Inventory Alerts</span>
                <Icon d={ICONS.alert} size={17} color="#f59e0b" />
              </div>

              {inventory.map(item => (
                <InvRow key={item.name} {...item} />
              ))}

              <div style={{ marginTop: 14, textAlign: "center" }}>
                <span className="manage-link" onClick={() => navigate("/products")} style={{ cursor: "pointer" }}>Manage Inventory</span>
              </div>
            </div>

          </div>

          {/* Recent Transactions Table */}
          <div className="rt-wrap">
            {/* Header */}
            <div className="rt-header">
              <span className="rt-title">Recent Transactions</span>
              <div className="rt-header-right">
                <div className="rt-filter-icon">
                  <span />
                  <span />
                </div>
                <span className="rt-view-all" onClick={() => navigate("/invoices")}>View All</span>
              </div>
            </div>

            {/* Column labels */}
            <div className="rt-col-headers">
              <span className="rt-col-label">Invoice</span>
              <span className="rt-col-label">Customer</span>
              <span className="rt-col-label">Status</span>
              <span className="rt-col-label">Items</span>
              <span className="rt-col-label">Total</span>
              <span className="rt-col-label">Mode</span>
              <span className="rt-col-label right">Profit</span>
            </div>

            {/* Rows */}
            {invoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 14 }}>No transactions yet</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  <span style={{ color: "#7c5cfc", cursor: "pointer" }} onClick={() => navigate("/createbill")}>
                    Create your first invoice
                  </span>
                </div>
              </div>
            ) : (
              [...invoices].reverse().slice(0, 5).map((inv, idx) => {
                // Generate avatar gradient colors
                const gradients = [
                  "linear-gradient(135deg,#7c5cfc,#4f3bc0)",
                  "linear-gradient(135deg,#f472b6,#9333ea)",
                  "linear-gradient(135deg,#6366f1,#2563eb)",
                  "linear-gradient(135deg,#f59e0b,#b45309)",
                  "linear-gradient(135deg,#10b981,#059669)",
                ];
                const avatarBg = gradients[idx % gradients.length];
                
                // Get initials from customer name
                const initials = inv.customerName
                  ? inv.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                  : "??";
                
                // Determine status (you can add a status field to your invoice schema if needed)
                const status = inv.paymentStatus || "paid"; // Default to paid if no status field
                
                return (
                  <div 
                    className="rt-row" 
                    key={inv._id || idx}
                    onClick={() => navigate(`/invoice/${inv._id}`)}
                  >
                    <span className="rt-invoice">#{inv.invoiceNumber}</span>
                    <div className="rt-customer">
                      <div className="rt-avatar" style={{ background: avatarBg }}>
                        {initials}
                      </div>
                      <span className="rt-customer-name">{inv.customerName || "Unknown"}</span>
                    </div>
                    <div>
                      <span className={`rt-badge ${status.toLowerCase()}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <span className="rt-items">{inv.items?.length || 0}</span>
                    <span className="rt-total">₹{Number(inv.total || 0).toLocaleString("en-IN")}</span>
                    <span className="rt-mode">{inv.paymode || "CASH"}</span>
                    <span className="rt-profit">+₹{Number(inv.profit || 0).toLocaleString("en-IN")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}