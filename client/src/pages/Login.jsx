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
  CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function InvoMateLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = React.useState({ email: "", password: "" });
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
          className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-[#f9f9fc] border-r border-gray-100 relative overflow-hidden"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-indigo-100 opacity-50 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-[-60px] w-72 h-72 rounded-full bg-purple-100 opacity-40 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black tracking-[-0.06em] uppercase leading-none bg-gradient-to-r from-slate-900 via-indigo-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              Invo<span className="text-indigo-600">Mate</span>
            </span>
          </div>

          {/* Headline */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              Business Suite
            </div>

            <h2 className="text-3xl font-bold text-gray-900 leading-snug tracking-tight">
              Manage your business<br />
              <span className="text-indigo-600">smarter, faster.</span>
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              GST invoicing, inventory tracking, and profit insights — all in one place.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3">
              {[
                { icon: <LayoutDashboard size={15} />, text: "Real-time dashboard" },
                { icon: <FileText size={15} />, text: "GST Invoices" },
                { icon: <Boxes size={15} />, text: "Smart inventory" },
                { icon: <TrendingUp size={15} />, text: "Profit tracking" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-indigo-500 flex-shrink-0">
                    {icon}
                  </div>
                  <span className="text-sm text-gray-600">{text}</span>
                  <CheckCircle2 size={14} className="text-green-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badges */}
          <div className="flex items-center gap-2 flex-wrap relative z-10">
            {["GST Ready", "Secure", "Fast Billing"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 font-medium"
              >
                {tag}
              </span>
            ))}
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
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-black tracking-[-0.06em] uppercase leading-none bg-gradient-to-r from-slate-900 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Invo<span className="text-indigo-600">Mate</span>
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h3>
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
                  <button type="button" className="text-xs text-indigo-500 hover:text-indigo-700 transition font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3.5 h-11 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition">
                  <Lock size={15} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    className="bg-transparent w-full px-2.5 outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  />
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
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm mt-1"
                whileHover={isSubmitting ? undefined : { scale: 1.015, y: -1 }}
                whileTap={isSubmitting ? undefined : { scale: 0.985 }}
              >
                {isSubmitting ? "Signing in…" : "Sign in to Dashboard →"}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Secure Login</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </form>

          </motion.div>
        </motion.div>
    </motion.div>
  );
}