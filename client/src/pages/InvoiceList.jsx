import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const StatusBadge = ({ s }) => {
  const map = {
    PAID:    { bg: "rgba(16,185,129,.15)",  color: "#34d399", border: "rgba(16,185,129,.3)" },
    PENDING: { bg: "rgba(245,158,11,.15)",  color: "#fbbf24", border: "rgba(245,158,11,.3)" },
    OVERDUE: { bg: "rgba(239,68,68,.15)",   color: "#f87171", border: "rgba(239,68,68,.3)"  },
  };
  const c = map[s] || map.PENDING;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      {s}
    </span>
  );
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
      background: "linear-gradient(135deg,#111827 0%,#0f172a 100%)",
      border: "1px solid rgba(99,102,241,.18)",
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
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 20, color: accent }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>
  </div>
);

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
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
  
  // Calculate unpaid amount (you can add a status field to invoices if needed)
  const unpaidInvoices = invoices.filter(inv => !inv.paid && inv.paymentStatus !== "PAID");
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  
  // Calculate this month's revenue
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const thisMonthInvoices = invoices.filter(inv => {
    const [day, month, year] = inv.date.split('-');
    return Number(month) - 1 === currentMonth && Number(year) === currentYear;
  });
  const monthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  
  // Calculate overdue (invoices older than 30 days and not paid)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const overdueInvoices = invoices.filter(inv => {
    const [day, month, year] = inv.date.split('-');
    const invDate = new Date(year, month - 1, day);
    return invDate < thirtyDaysAgo && !inv.paid && inv.paymentStatus !== "PAID";
  });
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  // Transform backend data to match UI format
  const transformedInvoices = invoices.map((inv, idx) => {
    const colors = ["#6366f1", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];
    const color = colors[idx % colors.length];
    
    // Get initials
    const initials = inv.customerName
      ? inv.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
      : "??";
    
    // Determine status
    const [day, month, year] = inv.date.split('-');
    const invDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((today - invDate) / (1000 * 60 * 60 * 24));
    
    let status = "PAID";
    let note = "Verified Payment";
    
    if (inv.paymentStatus === "PENDING" || !inv.paid) {
      if (daysDiff > 30) {
        status = "OVERDUE";
        note = `${daysDiff - 30} Days Overdue`;
      } else {
        status = "PENDING";
        note = "Action Required";
      }
    }
    
    // Format date
    const dateObj = new Date(year, month - 1, day);
    const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    
    return {
      id: `#INV-${inv.invoiceNumber}`,
      customer: inv.customerName || "Unknown",
      email: inv.email || "N/A",
      phone: inv.phone || "+91 XXXXX XXXXX",
      avatar: initials,
      color: color,
      status: status,
      amount: Number(inv.total) || 0,
      profit: Number(inv.profit) || 0,
      method: inv.paymode || "CASH",
      date: formattedDate,
      note: note,
      _id: inv._id,
    };
  });

  const filtered = transformedInvoices.filter((inv) => {
    const matchStatus = filter === "All" || inv.status === filter;
    const matchSearch =
      inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#080b14", color: "#e2e8f0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>Loading...</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Fetching your invoices</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e2e8f0" }}>
      <Sidebar shopName={shopName} onLogout={handleLogout} />

      {/* Main */}
      <main style={{ marginLeft: SIDEBAR_WIDTH, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
        {/* Topbar */}
        <header
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(99,102,241,.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(13,16,23,.8)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            {["Overview", "Reports", "History"].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 14,
                  color: t === "Reports" ? "#818cf8" : "#6b7280",
                  cursor: "pointer",
                  fontWeight: t === "Reports" ? 600 : 400,
                  borderBottom: t === "Reports" ? "2px solid #6366f1" : "2px solid transparent",
                  paddingBottom: 4,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              <span style={{ color: "#6b7280", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across platform..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: 13,
                  width: 160,
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
            >
              🔔
            </div>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(99,102,241,.1)",
                border: "1px solid rgba(99,102,241,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16,
              }}
            >
              🌙
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
              <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Invoices</h1>
              <p style={{ color: "#6b7280", fontSize: 14 }}>Manage your billing cycles and track revenue performance.</p>
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
                onClick={() => navigate("/createbill")}
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
              label="Total Unpaid" 
              value={fmt(totalUnpaid)} 
              sub={`${unpaidInvoices.length} pending invoices`} 
              icon="📋" 
              accent="#6366f1" 
            />
            <StatCard 
              label="Revenue This Month" 
              value={fmt(monthRevenue)} 
              sub={`${thisMonthInvoices.length} invoices this month`} 
              icon="💰" 
              accent="#10b981" 
            />
            <StatCard 
              label="Overdue Amount" 
              value={fmt(overdueAmount)} 
              sub={`${overdueInvoices.length} overdue items`} 
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
            {["All", "PAID", "PENDING", "OVERDUE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? "rgba(99,102,241,.18)" : "rgba(99,102,241,.05)",
                  border: `1px solid ${filter === f ? "rgba(99,102,241,.5)" : "rgba(99,102,241,.15)"}`,
                  borderRadius: 8,
                  color: filter === f ? "#818cf8" : "#6b7280",
                  padding: "7px 16px", fontSize: 13,
                  fontWeight: filter === f ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {f === "All" ? "Status: All" : f}
              </button>
            ))}
            <div style={{ background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 8, color: "#6b7280", padding: "7px 16px", fontSize: 13 }}>
              📅 Date Range: Last 30 Days
            </div>
            <div style={{ background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 8, color: "#6b7280", padding: "7px 16px", fontSize: 13 }}>
              👤 Client Name
            </div>
            <button
              onClick={() => { setFilter("All"); setSearch(""); }}
              style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(99,102,241,.2)", borderRadius: 8, color: "#6b7280", padding: "7px 16px", fontSize: 13, cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div style={{ background: "#0d1117", border: "1px solid rgba(99,102,241,.15)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,.06)", borderBottom: "1px solid rgba(99,102,241,.12)" }}>
                    {["Invoice ID", "Customer", "Phone", "Status", "Amount", "Profit", "Payment", "Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 600,
                          color: "#4b5563", letterSpacing: 0.8,
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
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{inv.customer}</div>
                            <div style={{ fontSize: 12, color: "#4b5563" }}>{inv.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{inv.phone}</span>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <StatusBadge s={inv.status} />
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{fmt(inv.amount)}</div>
                        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{inv.method}</div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#34d399" }}>{fmt(inv.profit)}</div>
                        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                          {Math.round((inv.profit / inv.amount) * 100)}% margin
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <span
                          style={{
                            fontSize: 11, color: "#6b7280",
                            background: "rgba(99,102,241,.06)",
                            border: "1px solid rgba(99,102,241,.12)",
                            padding: "3px 8px", borderRadius: 6,
                          }}
                        >
                          {inv.method}
                        </span>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ fontSize: 13, color: "#9ca3af" }}>{inv.date}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: inv.status === "OVERDUE" ? "#f87171" : inv.status === "PENDING" ? "#fbbf24" : "#34d399",
                            marginTop: 2,
                            fontWeight: 500,
                          }}
                        >
                          {inv.note}
                        </div>
                      </td>
                      <td style={{ padding: "16px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoice/${inv._id}`);
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
              <span style={{ fontSize: 13, color: "#4b5563" }}>
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
                      color: p === "1" ? "#fff" : "#6b7280",
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