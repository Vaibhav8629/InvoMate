import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { API_ENDPOINTS } from "../config/api";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function InvoMateLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = React.useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.status === 200) {
        await loginUser();
        navigate("/home");
      } else {
        setErrorMessage(data.msg || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen w-full flex bg-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >

        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 30%,#4338ca 60%,#6366f1 85%,#818cf8 100%)" }}
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Blobs */}
          <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-[55px] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(99,102,241,0.45),transparent 70%)" }} />
          <div className="absolute -bottom-14 -left-14 w-60 h-60 rounded-full blur-[55px] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(6,182,212,0.3),transparent 70%)" }} />
          <div className="absolute bottom-1/3 right-10 w-44 h-44 rounded-full blur-[35px] pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(167,139,250,0.4),transparent 70%)" }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
              backgroundSize: "38px 38px"
            }} />

          {/* Logo */}
          <div className="flex items-center gap-2 relative z-10 text-[24px] font-extrabold tracking-[-0.04em] leading-none text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
              <FileText size={18} color="#fff" />
            </div>
            <span>
              Invo<span style={{ color: "var(--accent)" }}>Mate</span>
            </span>
          </div>

          {/* Middle: headline + features */}
          <div className="relative z-10">
            

            <h2 className="text-4xl font-black leading-tight mb-3"
              style={{ color: "#fff", letterSpacing: "-1.5px" }}>
              Manage your<br />
              business <span style={{ color: "#c7d2fe" }}>smarter</span>,<br />
              faster.
            </h2>
            <p className="text-sm leading-7 mb-7" style={{ color: "rgba(199,210,254,0.85)" }}>
              GST invoicing, inventory tracking, and profit insights — all in one place. 📊
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: "📊", color: "rgba(99,102,241,0.35)", label: "Real-time Dashboard", desc: "Live business metrics at a glance" },
                { icon: "🧾", color: "rgba(6,182,212,0.3)",   label: "GST Invoices",        desc: "Auto-calculated GST billing" },
                { icon: "📦", color: "rgba(167,139,250,0.3)", label: "Smart Inventory",     desc: "Track stock levels in real-time" },
                { icon: "📈", color: "rgba(16,185,129,0.25)", label: "Profit Tracking",     desc: "Visualise revenue & margins" },
              ].map(({ icon, color, label, desc }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: color }}>{icon}</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#e0e7ff" }}>{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(199,210,254,0.7)" }}>{desc}</div>
                  </div>
                  <span className="ml-auto text-sm">✅</span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>

        {/* ── RIGHT PANEL ── */}
        <motion.div
          className="flex-1 flex items-center justify-center p-8 lg:p-12"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <motion.div className="w-full max-w-sm" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.28, delay: 0.12 }}>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden text-[24px] font-extrabold tracking-[-0.04em] leading-none text-gray-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
                <FileText size={18} color="#fff" />
              </div>
              <span>
                Invo<span style={{ color: "var(--accent)" }}>Mate</span>
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back 👋</h3>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue.</p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Work Email
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 h-11 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="bg-transparent w-full px-2.5 outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/auth/forgot-password')}
                    className="text-xs text-indigo-500 hover:text-indigo-700 transition font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 h-11 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition">
                  <Lock size={15} className="text-gray-400 flex-shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    className="bg-transparent w-full px-2.5 outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="flex-shrink-0 text-gray-400 transition hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Error */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5 rounded-xl"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl text-white text-sm font-semibold shadow-sm mt-1 transition"
                style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
                whileHover={isSubmitting ? undefined : { scale: 1.015, y: -1 }}
                whileTap={isSubmitting ? undefined : { scale: 0.985 }}
              >
                {isSubmitting ? "Signing in…" : <span className="text-white">🚀 Sign in to Dashboard →</span>}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">🔐 Secure Login</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </form>

          </motion.div>
        </motion.div>
    </motion.div>
  );
}