import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import { useThemeMode } from "../store/theme";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const parseInvoiceDate = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const Avatar = ({ name, color }) => (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      background: color + "22",
      border: `1.5px solid ${color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 12,
      color,
      flexShrink: 0,
    }}
  >
    {name}
  </div>
);

const StatCard = ({ label, value, sub, icon, accent }) => (
  <div
    style={{
      background: "linear-gradient(135deg,var(--surface) 0%, var(--surface-2) 100%)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 14,
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: accent + "08",
        borderRadius: "0 14px 0 100%",
      }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 20, color: accent }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>
  </div>
);

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { theme, toggleTheme } = useThemeMode();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [invoices, setInvoices] = useState([]);
  const [shopName, setShopName] = useState("Elite Workspace");
  const [loading, setLoading] = useState(true);

  // Fetch invoices from backend
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

        // Fetch profile for shop name
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

  // Calculate metrics from invoices
  const today = new Date();
  const formattedToday = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  
  const todayInvoices = invoices.filter(inv => inv.date === formattedToday);
  const todayCount = todayInvoices.length;
  const todayProfit = todayInvoices.reduce((sum, inv) => sum + (Number(inv.profit) || 0), 0);
  
  // Calculate this month's revenue
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const thisMonthInvoices = invoices.filter(inv => {
    const [day, month, year] = inv.date.split('-');
    return Number(month) - 1 === currentMonth && Number(year) === currentYear;
  });
  const monthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  
  // Transform backend data to match UI format
  const transformedInvoices = invoices.map((inv, idx) => {
    const colors = ["#6366f1", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];
    const color = colors[idx % colors.length];
    
    // Get initials
    const initials = inv.customerName
      ? inv.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
      : "??";
    
    const invDate = parseInvoiceDate(inv.date);
    
    // Format date
    const formattedDate = invDate
      ? invDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "Invalid date";
    
    return {
      id: `#INV-${inv.invoiceNumber}`,
      customer: inv.customerName || "Unknown",
      email: inv.email || "N/A",
      phone: inv.phone || "+91 XXXXX XXXXX",
      avatar: initials,
      color: color,
      note: "Payment recorded",
      amount: Number(inv.total) || 0,
      profit: Number(inv.profit) || 0,
      method: inv.paymode || "CASH",
      date: formattedDate,
      rawDate: invDate,
      _id: inv._id,
    };
  });

  const filtered = transformedInvoices.filter((inv) => {
    const matchSearch =
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      matchDate = inv.rawDate ? inv.rawDate >= startDate : false;
    }
    if (matchDate && dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      matchDate = inv.rawDate ? inv.rawDate <= endDate : false;
    }
    return matchSearch && matchDate;
  });

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>Loading...</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Fetching your invoices</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--text-primary)", paddingLeft: SIDEBAR_WIDTH }}>
      <Sidebar shopName={shopName} onLogout={handleLogout} />

      {/* Main */}
      <main style={{ marginLeft: 0, display: "flex", flexDirection: "column", overflowX: "hidden", paddingTop: "52px" }}>
        {/* Topbar */}
        <header
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(99,102,241,.1)",
            marginLeft: -SIDEBAR_WIDTH,
            position: "fixed",
            top: 0,
            left: SIDEBAR_WIDTH,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
            backdropFilter: "blur(12px)",
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1 }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search */}
            <div
              style={{
                background: "rgba(99,102,241,.08)",
                border: "1px solid rgba(99,102,241,.2)",
                borderRadius: 10,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across platform..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  width: 180,
                }}
              />
            </div>
            
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(99,102,241,.1)",
                border: "1px solid rgba(99,102,241,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16,
              }}
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </div>
            <button
              style={{
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                border: "none", borderRadius: 10,
                color: "#fff", padding: "8px 18px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </header>

        <div style={{ padding: "28px 28px 40px", flex: 1 }}>
          {/* Page Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Invoices</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage your billing cycles and track revenue performance.</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{
                  background: "rgba(99,102,241,.08)",
                  border: "1px solid rgba(99,102,241,.25)",
                  borderRadius: 10, color: "#818cf8",
                  padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                ⬇ Export CSV
              </button>
              <button
                onClick={() => navigate("/invoice/create")}
                style={{
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                  border: "none", borderRadius: 10,
                  color: "#fff", padding: "10px 20px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                + Create New Invoice
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            <StatCard 
              label="Today's Invoices" 
              value={todayCount.toString()} 
              sub="Invoices created today" 
              icon="📋" 
              accent="#6366f1" 
            />
            <StatCard 
              label="Today's Profit" 
              value={fmt(todayProfit)} 
              sub="Profit from today's invoices" 
              icon="💰" 
              accent="#10b981" 
            />
            <StatCard 
              label="Revenue This Month" 
              value={fmt(monthRevenue)} 
              sub={`${thisMonthInvoices.length} invoices this month`} 
              icon="⚠️" 
              accent="#f59e0b" 
            />
            <StatCard 
              label="Total Invoices" 
              value={invoices.length.toString()} 
              sub="All time invoices" 
              icon="📑" 
              accent="#818cf8" 
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>📅 Date Range</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                style={{
                  background: "rgba(99,102,241,.05)",
                  border: "1px solid rgba(99,102,241,.15)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  padding: "6px 10px",
                  fontSize: 12,
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                style={{
                  background: "rgba(99,102,241,.05)",
                  border: "1px solid rgba(99,102,241,.15)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  padding: "6px 10px",
                  fontSize: 12,
                }}
              />
            </div>
            <button
              onClick={() => { setSearch(""); setDateRange({ start: "", end: "" }); }}
              style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(99,102,241,.2)", borderRadius: 8, color: "var(--text-muted)", padding: "7px 16px", fontSize: 13, cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,.06)", borderBottom: "1px solid rgba(99,102,241,.12)" }}>
                    {["Invoice ID", "Customer", "Phone", "Amount", "Profit", "Payment", "Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 600,
                          color: "var(--text-muted)", letterSpacing: 0.8,
                          textTransform: "uppercase", whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid rgba(99,102,241,.07)", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px 16px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, color: "#818cf8", fontWeight: 500 }}>
                          {inv.id}
                        </span>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={inv.avatar} color={inv.color} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{inv.customer}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{inv.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{inv.phone}</span>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(inv.amount)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{inv.method}</div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#34d399" }}>{fmt(inv.profit)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {Math.round((inv.profit / inv.amount) * 100)}% margin
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <span
                          style={{
                            fontSize: 11, color: "var(--text-muted)",
                            background: "rgba(99,102,241,.06)",
                            border: "1px solid rgba(99,102,241,.12)",
                            padding: "3px 8px", borderRadius: 6,
                          }}
                        >
                          {inv.method}
                        </span>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{inv.date}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontWeight: 500 }}>
                          {inv.note}
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoice/view/${inv._id}`);
                            }}
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "rgba(99,102,241,.1)",
                              border: "1px solid rgba(99,102,241,.2)",
                              color: "#818cf8", cursor: "pointer", fontSize: 14,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            title="View Invoice"
                          >
                            👁
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoice/edit/${inv._id}`);
                            }}
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "rgba(245,158,11,.08)",
                              border: "1px solid rgba(245,158,11,.2)",
                              color: "#f59e0b", cursor: "pointer", fontSize: 14,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            title="Edit Invoice"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add download functionality here if needed
                              console.log("Download invoice:", inv.id);
                            }}
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "rgba(16,185,129,.08)",
                              border: "1px solid rgba(16,185,129,.2)",
                              color: "#34d399", cursor: "pointer", fontSize: 14,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            title="Download Invoice"
                          >
                            ⬇
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(99,102,241,.1)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Showing <strong style={{ color: "#818cf8" }}>{filtered.length}</strong> of{" "}
                <strong style={{ color: "#818cf8" }}>{invoices.length}</strong> invoices
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {["←", "1", "→"].map((p, i) => (
                  <button
                    key={i}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: p === "1" ? "linear-gradient(135deg,#6366f1,#818cf8)" : "rgba(99,102,241,.06)",
                      border: `1px solid ${p === "1" ? "transparent" : "rgba(99,102,241,.15)"}`,
                      color: p === "1" ? "#fff" : "var(--text-muted)",
                      cursor: "pointer", fontSize: 13, fontWeight: p === "1" ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}