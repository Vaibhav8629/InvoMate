import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import { useAuth } from "../store/auth";
import { useThemeMode } from "../store/theme";

const GST_REPORT_PAGE_STYLES = `
  .gst-report-page {
    color: var(--text-primary);
  }

  .gst-report-page .gst-card-title {
    color: var(--text-primary) !important;
    font-weight: 700;
  }

  .gst-report-page .gst-card-subtext {
    color: var(--text-muted) !important;
  }

  .gst-report-page .gst-table-card {
    border-color: rgba(30, 41, 59, 0.18) !important;
  }

  .gst-report-page .gst-table-card thead tr {
    background: rgba(99, 102, 241, 0.08) !important;
  }

  .gst-report-page .gst-table-card th {
    color: var(--text-muted) !important;
  }

  .gst-report-page .gst-table-card td {
    color: var(--text-primary) !important;
  }

  .gst-report-page .gst-chart-card {
    border-color: rgba(30, 41, 59, 0.18) !important;
  }

  @media (max-width: 1200px) {
    .gst-charts-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media print {
    .gst-report-page {
      padding-left: 0 !important;
      background: #ffffff !important;
      color: #111827 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .gst-report-page aside,
    .gst-report-page > main > header,
    .no-print {
      display: none !important;
    }

    .gst-report-main {
      padding-top: 0 !important;
    }

    .gst-report-content {
      padding: 0 !important;
    }

    .gst-chart-card,
    .gst-table-card {
      break-inside: avoid;
      page-break-inside: avoid;
      background: #ffffff !important;
      border: 1px solid #9ca3af !important;
    }

    .gst-report-page h1,
    .gst-report-page h2,
    .gst-report-page h3,
    .gst-report-page p,
    .gst-report-page span,
    .gst-report-page div,
    .gst-report-page td,
    .gst-report-page th {
      color: #111827 !important;
    }

    .gst-table-card table {
      border-collapse: collapse !important;
      width: 100% !important;
    }

    .gst-table-card th,
    .gst-table-card td {
      border-bottom: 1px solid #d1d5db !important;
    }

    .gst-table-card thead tr {
      background: #e5e7eb !important;
    }

    .gst-report-page .gst-card-subtext {
      color: #374151 !important;
    }

    .gst-report-page .gst-card-title {
      color: #0f172a !important;
    }
  }
`;

const formatCurrency = (value) => `₹ ${(Number(value) || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

const formatDate = (value) => {
  if (!value) return "-";
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const StatCard = ({ label, value, accent, icon }) => (
  <div
    style={{
      background: "linear-gradient(135deg,var(--surface) 0%, var(--surface-2) 100%)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 14,
      padding: "16px 18px",
      minHeight: 112,
      position: "relative",
      overflow: "hidden"
    }}
  >
    <div
      style={{
        position: "absolute",
        right: -10,
        top: -10,
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: `${accent}15`
      }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 600 }}>{label}</span>
      <span style={{ color: accent, fontSize: 18 }}>{icon}</span>
    </div>
    <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 24, fontVariantNumeric: "tabular-nums" }}>{value}</div>
  </div>
);

const buildQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.startDate || filters.endDate) {
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    return params.toString();
  }

  if (filters.month && filters.year) {
    params.set("month", filters.month);
    params.set("year", filters.year);
    return params.toString();
  }

  if (filters.year) {
    params.set("year", filters.year);
  }

  return params.toString();
};

export default function GSTReportsPage() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { theme, toggleTheme } = useThemeMode();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalTaxableAmount: 0,
    totalGST: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    invoices: [],
    hsnSummary: [],
    monthlyTrend: [],
    gstSplit: { cgst: 0, sgst: 0, igst: 0 },
    formatted: {
      totalRevenue: formatCurrency(0),
      totalTaxableAmount: formatCurrency(0),
      totalGST: formatCurrency(0),
      cgstTotal: formatCurrency(0),
      sgstTotal: formatCurrency(0),
      igstTotal: formatCurrency(0)
    }
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    month: "",
    year: String(new Date().getFullYear())
  });
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const fetchReport = async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(nextFilters);
      const url = `${import.meta.env.VITE_API_URL}/api/reports/gst${query ? `?${query}` : ""}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch GST report");
      }

      const data = await res.json();
      setReport(data);
      setPage(1);
    } catch (err) {
      setError(err.message || "Unable to load GST report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return report.invoices.slice(start, start + pageSize);
  }, [page, report.invoices]);

  const hsnRows = report.hsnSummary || [];
  const pageCount = Math.max(1, Math.ceil(report.invoices.length / pageSize));

  const pieData = [
    { name: "CGST", value: report.gstSplit?.cgst || 0, color: "#6366f1" },
    { name: "SGST", value: report.gstSplit?.sgst || 0, color: "#10b981" },
    { name: "IGST", value: report.gstSplit?.igst || 0, color: "#f59e0b" }
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const runFilter = () => {
    fetchReport(filters);
  };

  const exportFile = async (format) => {
    try {
      const query = buildQuery(filters);
      const endpoint = format === "csv" ? "csv" : "pdf";
      const url = `${import.meta.env.VITE_API_URL}/api/reports/gst/export/${endpoint}${query ? `?${query}` : ""}`;
      const response = await fetch(url, {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Unable to export ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `gst-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || "Export failed");
    }
  };

  const getGstTypeStyle = (type) => {
    if (type === "INTER") {
      return {
        color: "#f59e0b",
        background: "rgba(245,158,11,.12)",
        border: "1px solid rgba(245,158,11,.32)"
      };
    }

    return {
      color: "#10b981",
      background: "rgba(16,185,129,.12)",
      border: "1px solid rgba(16,185,129,.28)"
    };
  };

  return (
    <div className="gst-report-page" style={{ minHeight: "100vh", background: "var(--bg-base)", paddingLeft: SIDEBAR_WIDTH, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{GST_REPORT_PAGE_STYLES}</style>
      <Sidebar onLogout={handleLogout} />

      <main className="gst-report-main" style={{ paddingTop: 52 }}>
        <header
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(99,102,241,.1)",
            position: "fixed",
            top: 0,
            left: SIDEBAR_WIDTH,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
            zIndex: 10
          }}
        >
          <div style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: 0.3 }}>
            GST Compliance and Reports
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(99,102,241,.2)",
                background: "rgba(99,102,241,.08)",
                color: "#818cf8",
                cursor: "pointer"
              }}
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <div className="gst-report-content" style={{ padding: "28px 28px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30, color: "var(--text-primary)", fontWeight: 700 }}>GST Reports</h1>
              <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>Generate GST summaries directly from invoice snapshots.</p>
            </div>
            <div className="no-print" style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => exportFile("csv")}
                style={{
                  background: "rgba(99,102,241,.08)",
                  color: "#818cf8",
                  border: "1px solid rgba(99,102,241,.25)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Export CSV
              </button>
              <button
                onClick={() => exportFile("pdf")}
                style={{
                  background: "rgba(16,185,129,.10)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,.3)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Export PDF
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                Print Report
              </button>
            </div>
          </div>

          <div className="no-print" style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 16, marginBottom: 26 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(140px,1fr))", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.05)", color: "var(--text-primary)", padding: "8px 10px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.05)", color: "var(--text-primary)", padding: "8px 10px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange("month", e.target.value)}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.05)", color: "var(--text-primary)", padding: "8px 10px" }}
                >
                  <option value="">All</option>
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx + 1} value={String(idx + 1).padStart(2, "0")}>{String(idx + 1).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Year</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  min="2000"
                  max="2100"
                  style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.05)", color: "var(--text-primary)", padding: "8px 10px" }}
                />
              </div>
              <button
                onClick={runFilter}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                  color: "#fff",
                  fontWeight: 600,
                  padding: "10px 14px",
                  cursor: "pointer"
                }}
              >
                Generate Report
              </button>
            </div>
          </div>

          {error && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{error}</div>}

          <div style={{ marginBottom: 12 }}>
            <h2 className="gst-card-title" style={{ margin: 0, fontSize: 18, color: "var(--text-primary)", fontWeight: 700 }}>GST Summary</h2>
            <p className="gst-card-subtext" style={{ marginTop: 6, marginBottom: 0, fontSize: 13, color: "var(--text-muted)" }}>Snapshot totals derived from invoice GST entries.</p>
          </div>

          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(4,minmax(180px,1fr))", marginBottom: 28 }}>
            <StatCard label="Total Revenue" value={report.formatted?.totalRevenue || formatCurrency(report.totalRevenue)} accent="#6366f1" icon="💰" />
            <StatCard label="Taxable Amount" value={report.formatted?.totalTaxableAmount || formatCurrency(report.totalTaxableAmount)} accent="#10b981" icon="📊" />
            <StatCard label="Total GST" value={report.formatted?.totalGST || formatCurrency(report.totalGST)} accent="#f59e0b" icon="🧾" />
            <StatCard label="Invoice Count" value={report.totalInvoices} accent="#06b6d4" icon="📄" />
            <StatCard label="CGST Total" value={report.formatted?.cgstTotal || formatCurrency(report.cgstTotal)} accent="#6366f1" icon="C" />
            <StatCard label="SGST Total" value={report.formatted?.sgstTotal || formatCurrency(report.sgstTotal)} accent="#10b981" icon="S" />
            <StatCard label="IGST Total" value={report.formatted?.igstTotal || formatCurrency(report.igstTotal)} accent="#f59e0b" icon="I" />
          </div>

          <div className="gst-charts-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, marginBottom: 20 }}>
            <div className="gst-chart-card" style={{ minWidth: 0, background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 16 }}>
              <div style={{ marginBottom: 10, fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>Monthly GST Trend</div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={report.monthlyTrend || []} margin={{ top: 8, right: 8, left: -10, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 10 }}
                    />
                    <Bar dataKey="gst" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="gst-chart-card" style={{ minWidth: 0, background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: 16 }}>
              <div style={{ marginBottom: 10, fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>GST Split</div>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 10 }} />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <h2 className="gst-card-title" style={{ margin: 0, fontSize: 18, color: "var(--text-primary)", fontWeight: 700 }}>Invoice Breakdown</h2>
            <p className="gst-card-subtext" style={{ marginTop: 6, marginBottom: 0, fontSize: 13, color: "var(--text-muted)" }}>Invoice-wise GST details with transaction classification.</p>
          </div>

          <div className="gst-table-card" style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1120, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "190px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "95px" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: "125px" }} />
                  <col style={{ width: "115px" }} />
                  <col style={{ width: "115px" }} />
                  <col style={{ width: "115px" }} />
                  <col style={{ width: "145px" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,.06)", borderBottom: "1px solid rgba(99,102,241,.12)" }}>
                    {["Invoice ID", "Customer Name", "Date", "GST Type", "GST %", "Taxable Amount", "CGST", "SGST", "IGST", "Total"].map((header, idx) => (
                      <th
                        key={header}
                        style={{
                          padding: "12px 14px",
                          textAlign: idx >= 5 ? "right" : "left",
                          fontSize: 11,
                          textTransform: "uppercase",
                          color: "var(--text-muted)",
                          letterSpacing: 0.8
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!loading && paginatedInvoices.map((invoice) => {
                    const gstType = invoice.gstType || "INTRA";
                    const badgeStyle = getGstTypeStyle(gstType);

                    return (
                    <tr key={invoice.invoiceId} style={{ borderBottom: "1px solid rgba(99,102,241,.08)" }}>
                      <td style={{ padding: "12px 14px", color: "#818cf8", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {invoice.invoiceNumber || String(invoice.invoiceId).slice(-6)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {invoice.customerName}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{invoice.formatted?.date || formatDate(invoice.date)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            ...badgeStyle,
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            display: "inline-flex"
                          }}
                        >
                          {gstType}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                        {typeof invoice.gstRate === "number" ? `${invoice.gstRate}%` : invoice.gstRate}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {invoice.formatted?.taxableAmount || formatCurrency(invoice.taxableAmount)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {invoice.formatted?.cgst || formatCurrency(invoice.cgst)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {invoice.formatted?.sgst || formatCurrency(invoice.sgst)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {invoice.formatted?.igst || formatCurrency(invoice.igst)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>
                        {invoice.formatted?.grandTotal || formatCurrency(invoice.grandTotal)}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            <div className="no-print" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(99,102,241,.12)" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Showing {paginatedInvoices.length} of {report.invoices.length} invoices
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.06)", color: "var(--text-primary)", padding: "6px 10px", cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}
                >
                  Prev
                </button>
                <span style={{ fontSize: 13, color: "var(--text-primary)", alignSelf: "center" }}>{page} / {pageCount}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  style={{ borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(99,102,241,.06)", color: "var(--text-primary)", padding: "6px 10px", cursor: "pointer", opacity: page === pageCount ? 0.4 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {hsnRows.length > 0 && (
            <>
              <div style={{ marginTop: 28, marginBottom: 12 }}>
                <h2 className="gst-card-title" style={{ margin: 0, fontSize: 18, color: "var(--text-primary)", fontWeight: 700 }}>HSN Summary</h2>
                <p className="gst-card-subtext" style={{ marginTop: 6, marginBottom: 0, fontSize: 13, color: "var(--text-muted)" }}>Grouped tax summary by HSN code.</p>
              </div>

              <div className="gst-table-card" style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "170px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "150px" }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: "rgba(99,102,241,.06)", borderBottom: "1px solid rgba(99,102,241,.12)" }}>
                        {["HSN", "Taxable Value", "GST", "CGST", "SGST", "IGST"].map((header, idx) => (
                          <th
                            key={header}
                            style={{
                              padding: "12px 14px",
                              textAlign: idx === 0 ? "left" : "right",
                              fontSize: 11,
                              textTransform: "uppercase",
                              color: "var(--text-muted)",
                              letterSpacing: 0.8
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hsnRows.map((row) => (
                        <tr key={row.HSN} style={{ borderBottom: "1px solid rgba(99,102,241,.08)" }}>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 600 }}>{row.HSN}</td>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>{row.formatted?.taxableAmount || formatCurrency(row.taxableAmount)}</td>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>{row.formatted?.gst || formatCurrency(row.gst)}</td>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>{row.formatted?.cgst || formatCurrency(row.cgst)}</td>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>{row.formatted?.sgst || formatCurrency(row.sgst)}</td>
                          <td style={{ padding: "12px 14px", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap" }}>{row.formatted?.igst || formatCurrency(row.igst)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
