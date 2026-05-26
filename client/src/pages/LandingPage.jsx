import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../store/theme";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  TrendingUp,
  Mail,
  Lock,
  CheckCircle2,
  Send,
  Smartphone,
  Cloud,
  FileSpreadsheet,
  QrCode,
  PenTool,
  BarChart3,
  Users,
  Settings,
  Search,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
  Check
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeMode();
  const [activeTab, setActiveTab] = useState("billing");

  // Sync html data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Features list
  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Invoice Generation",
      desc: "Generate professional GST compliant invoices instantly with customized templates."
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "WhatsApp Sharing",
      desc: "Send invoice details directly to your customer's WhatsApp numbers instantly."
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Secure Cloud Storage",
      desc: "All your generated invoices are securely stored in the cloud for instant lookup."
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "GST Report Generation",
      desc: "Generate monthly and quarterly GST summaries and tax liability reports."
    },
    {
      icon: <FileSpreadsheet className="w-5 h-5" />,
      title: "CSV Export",
      desc: "Export invoices, products, and reports as clean spreadsheets for accounting."
    },
    {
      icon: <Boxes className="w-5 h-5" />,
      title: "Inventory Management",
      desc: "Track real-time stock levels, quantities, reorder points, and SKU alerts."
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      title: "Barcode Billing",
      desc: "Scan barcodes using a webcam or reader to instantly add products to active bills."
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: "Invoice Signature",
      desc: "Authenticate invoice PDFs with digital signatures/authorized shop initials."
    },
    // {
    //   icon: <BarChart3 className="w-5 h-5" />,
    //   title: "Analytics & Insights",
    //   desc: "Visualize your revenue performance, margins, profits, and top-selling SKUs."
    // },
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: "Smart Billing Dashboard",
      desc: "A centralized control center to track daily sales, revenue, and active invoices."
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Fast Search & Filtering",
      desc: "Find any historical invoice, product SKU, or customer profile in milliseconds."
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Secure Data Handling",
      desc: "Robust state-of-the-art secure password hashes and strict authentication protocols."
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Responsive System",
      desc: "Fully optimized and accessible on all your devices: desktop, tablet, and mobile."
    }
  ];

  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      {/* ── HEADER / NAVBAR ── */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-subtle)"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Invo<span style={{ color: "var(--accent)" }}>Mate</span>
            </span>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-secondary)" }}>Features</a>
            <a href="#analytics" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-secondary)" }}>Analytics</a>
            <a href="#billing" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-secondary)" }}>POS Billing</a>
            <a href="#security" className="text-sm font-medium hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-secondary)" }}>Security</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button 
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold hover:text-[var(--accent)] transition-colors cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              Login
            </button>

          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div 
            className="inline-flex items-center gap-2 border text-xs font-semibold px-3 py-1.5 rounded-full w-fit tracking-wide uppercase"
            style={{ 
              borderColor: "var(--border-subtle)", 
              background: "var(--surface-2)",
              color: "var(--accent)" 
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent)" }} />
            Premium Financial Suite
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Smart GST Billing & <br />
            <span style={{ color: "var(--accent)" }}>Inventory Management</span>
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            InvoMate simplifies business finance. Generate GST compliant invoices, track live inventory levels, perform automatic tax calculations, and export actionable insights. Everything a modern workspace needs to operate with surgical precision.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <a 
              href="#features"
              className="px-6 py-3 rounded-lg font-semibold border hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2"
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            >
              Explore Features
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 mt-6 pt-8 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>GST Compliant</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Inventory Sync</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Instant</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>PDF & CSV Exports</p>
            </div>
          </div>
        </div>

        {/* Hero Interactive UI Preview */}
        <div className="relative lg:ml-6">
          <div 
            className="absolute inset-0 bg-gradient-to-tr opacity-20 blur-3xl pointer-events-none rounded-full"
            style={{ background: "var(--accent)" }}
          />

          <div 
            className="relative border rounded-2xl p-6 shadow-2xl flex flex-col gap-5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-subtle)"
            }}
          >
            {/* Header / Top bar mock */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-xs font-mono px-3 py-1 rounded bg-[var(--surface-2)] text-[var(--text-muted)]">
                invomate.app/dashboard
              </div>
            </div>

            {/* Quick Metrics Cards Mock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">Today's Sales</span>
                <span className="text-xl font-bold font-mono text-[var(--accent)]">₹42,500</span>
                <span className="text-[10px] text-green-400 font-medium">↗ +18.4% vs yesterday</span>
              </div>
              <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)]">Low Stock Items</span>
                <span className="text-xl font-bold font-mono text-amber-500">3 SKUs</span>
                <span className="text-[10px] text-[var(--text-muted)]">Action required</span>
              </div>
            </div>

            {/* Mini billing table preview */}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="grid grid-cols-4 bg-[var(--surface-2)] p-2 text-[10px] uppercase font-mono font-bold text-[var(--text-muted)] border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">GST</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="grid grid-cols-4 p-2 text-xs font-medium">
                  <span className="truncate">Wireless Keyboard</span>
                  <span className="text-right font-mono text-[var(--text-secondary)]">2</span>
                  <span className="text-right font-mono text-[var(--text-secondary)]">18%</span>
                  <span className="text-right font-mono">₹2,998</span>
                </div>
                <div className="grid grid-cols-4 p-2 text-xs font-medium">
                  <span className="truncate">USB-C Cable 1.5m</span>
                  <span className="text-right font-mono text-[var(--text-secondary)]">5</span>
                  <span className="text-right font-mono text-[var(--text-secondary)]">12%</span>
                  <span className="text-right font-mono">₹1,120</span>
                </div>
              </div>
            </div>

            {/* Total footer */}
            <div className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Grand Total</span>
              <span className="text-base font-bold font-mono text-[var(--accent)]">₹4,118</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="border-t py-20 bg-[var(--surface)]" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to run your business</h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              InvoMate comes loaded with a comprehensive set of business management tools to automate your everyday operational overhead.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div 
                key={i}
                className="group border p-6 rounded-2xl transition-all duration-300 hover:shadow-xl flex flex-col gap-4"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-subtle)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[var(--accent)] group-hover:text-white"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--accent)"
                  }}
                >
                  {feat.icon}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">{feat.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS & INSIGHTS SECTION ── */}
      <section id="analytics" className="border-t py-20" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Analytics & Reporting</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Real-Time Revenue & Profit Tracking</h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              No more manual calculators or spreadsheet formulas. View live tracking of your business margins, net profits, and tax categories automatically structured from invoice entries.
            </p>

            <ul className="flex flex-col gap-3">
              {[
                "Daily, weekly, and monthly margin tracking",
                "Automated GST liability calculations",
                "Beautiful interactive sales and revenue charts",
                "Detailed CSV spreadsheets ready for tax filing"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/20 text-green-500">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Chart Illustration Mock */}
          <div 
            className="border p-6 rounded-2xl shadow-xl flex flex-col gap-6 relative"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-subtle)"
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Revenue Trend</p>
                <p className="text-xl font-bold">Monthly Margin Analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">Live Update</span>
              </div>
            </div>

            {/* Mock SVG Line Chart */}
            <div className="h-44 w-full relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="37" x2="400" y2="37" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="112" x2="400" y2="112" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                
                {/* Area Fill */}
                <path d="M0,150 L0,120 L50,110 L100,130 L150,85 L200,98 L250,50 L300,70 L350,30 L400,20 L400,150 Z" fill="url(#chartGrad)" />
                {/* Line Path */}
                <path d="M0,120 L50,110 L100,130 L150,85 L200,98 L250,50 L300,70 L350,30 L400,20" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                {/* Dots */}
                <circle cx="250" cy="50" r="4" fill="var(--accent)" />
                <circle cx="400" cy="20" r="4" fill="var(--accent)" />
              </svg>
            </div>

            {/* Bottom Chart Labels */}
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SMART BILLING / POS INTERACTION SECTION ── */}
      <section id="billing" className="border-t py-20 bg-[var(--surface)]" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Smart Billing & POS</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frictionless Checkout POS</h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Process sales and generate clean, responsive GST invoices in seconds with a keyboard-friendly POS module.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div 
              className="border p-8 rounded-2xl flex flex-col gap-4"
              style={{
                background: "var(--bg-base)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Barcode Scan Ready</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Hook up any standard barcode scanner or scanner camera. Scan any product SKU to instantly append the item directly into your current billing items table without manual search.
              </p>
            </div>

            <div 
              className="border p-8 rounded-2xl flex flex-col gap-4"
              style={{
                background: "var(--bg-base)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Auto-calculated GST</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Tax slabs (0%, 5%, 12%, 18%, 28%) are automatically resolved and computed live against active billing items. Handles CGST, SGST, and IGST computations behind the scenes automatically.
              </p>
            </div>

            <div 
              className="border p-8 rounded-2xl flex flex-col gap-4"
              style={{
                background: "var(--bg-base)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Digital Quick Share</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Don't waste ink. Share professional digital copies of invoices instantly to your customer's email or WhatsApp directly from the dashboard view upon successful checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY SECTION ── */}
      <section id="security" className="border-t py-20" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left panel - mock locker UI */}
          <div className="relative flex justify-center">
            <div 
              className="absolute inset-0 bg-gradient-to-tr opacity-25 blur-3xl pointer-events-none rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <div 
              className="relative border rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "var(--accent)" }}>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="text-center flex flex-col gap-2">
                <h3 className="font-bold text-lg">Robust Security Protocols</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Your records, products, and customer databases are encrypted and protected natively.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-[var(--surface-2)]" style={{ borderColor: "var(--border-subtle)" }}>
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-mono font-medium">Bcrypt Password Hashing</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-[var(--surface-2)]" style={{ borderColor: "var(--border-subtle)" }}>
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-mono font-medium">HTTPS Secure Requests</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-[var(--surface-2)]" style={{ borderColor: "var(--border-subtle)" }}>
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-mono font-medium">SOC 2 Compliant Database</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Enterprise Grade Security</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Business Data, Safeguarded.</h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              We implement enterprise security patterns across our backend services. From secure cookie-based session tokens to native Bcrypt password salts, rest assured that your sales data and customer contacts are visible only to you.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-500">
                  <PenTool size={16} />
                </div>
                <h4 className="font-bold text-sm">Authorized Signature</h4>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Upload authorized digital signatures to verify the authenticity of all rendered invoice PDFs.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-500">
                  <Cloud size={16} />
                </div>
                <h4 className="font-bold text-sm">Cloud Protection</h4>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Secure MongoDB clusters isolate and protect workspace items and sales histories reliably.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="border-t py-20 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)]" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col gap-8 items-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Start managing your business <br /><span style={{ color: "var(--accent)", fontSize: "1.08em", letterSpacing: "-0.04em", textShadow: "0 10px 24px rgba(0,0,0,.08)" }}>smarter with InvoMate</span></h2>
          <p className="text-base max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Join thousands of smart businesses automating their financial ledger and invoice flows. Try InvoMate for free today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              Start Billing Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-12" style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-3xl font-black tracking-[-0.06em] leading-none"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, var(--accent) 55%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 10px 24px rgba(15,23,42,.12)",
                }}
              >
                Invo<span style={{ color: "var(--accent)" }}>Mate</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
              InvoMate is an elite financial operations and invoicing platform designed for small-to-medium businesses. Manage stock, bill customers, calculate taxes, and export detailed finance records easily.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:col-start-4 md:items-end md:text-right">
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold" style={{ color: "var(--text-primary)" }}>Quick Links</h4>
            <nav className="flex flex-col gap-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <a href="#features" className="hover:text-[var(--accent)] transition-colors">Features</a>
              <a href="#analytics" className="hover:text-[var(--accent)] transition-colors">Analytics</a>
              <a href="#billing" className="hover:text-[var(--accent)] transition-colors">POS Billing</a>
              <a href="#security" className="hover:text-[var(--accent)] transition-colors">Security</a>
            </nav>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
          <p>&copy; {new Date().getFullYear()} InvoMate Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
