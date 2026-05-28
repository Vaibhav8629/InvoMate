import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  ShieldAlert,
  Sparkles,
  FileText,
  Send,
  LoaderCircle,
} from "lucide-react";
import Toast from "../components/Toast";
import { requestPasswordReset } from "../services/passwordResetApi";

const emailRegex = /^\S+@\S+\.\S+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (!toast.open) return undefined;
    const timer = setTimeout(
      () => setToast((current) => ({ ...current, open: false })),
      3200
    );
    return () => clearTimeout(timer);
  }, [toast.open]);

  const showToast = (message, type = "info") =>
    setToast({ open: true, message, type });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Email is required.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await requestPasswordReset(email.trim());
      if (response.ok) {
        setSubmitted(true);
        showToast(data.msg || "Reset email sent.", "success");
      } else {
        showToast(data.msg || "Could not send reset email.", "error");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast("Unable to reach the server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 text-gray-900 overflow-hidden">

      {/* LEFT SIDE (Brand / Info) */}
      {/* LEFT SIDE (Brand / Info) */}
      <div className="w-1/2 relative flex flex-col justify-center px-16 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 85%, #818cf8 100%)"
        }}
      >
        {/* Blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[60px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-[60px]"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)" }} />
        <div className="absolute bottom-1/3 right-10 w-44 h-44 rounded-full blur-[40px]"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

        {/* Secure badge */}
        <div className="absolute top-7 right-7 text-xs font-semibold px-4 py-2 rounded-full border"
          style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", color: "#c7d2fe" }}>
          🔐 Secure Recovery
        </div>

        <div className="relative z-10 max-w-xl">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-2 text-[24px] font-extrabold tracking-[-0.04em] leading-none text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] flex-shrink-0">
              <FileText size={18} color="#fff" />
            </div>
            <span>
              Invo<span style={{ color: "var(--accent)" }}>Mate</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl font-black tracking-tight leading-tight mb-5" style={{ color: "#fff", letterSpacing: "-1.5px" }}>
            Reset your<br />
            <span style={{ color: "#c7d2fe" }}>password</span><br />
            safely & fast
          </h2>

          <p className="mb-10 leading-7 text-sm" style={{ color: "rgba(199,210,254,0.85)" }}>
            InvoMate uses a one-time token with a 15-minute expiry and a hidden
            account lookup flow — so recovery stays simple and secure. 🛡️
          </p>

          {/* Feature cards */}
          <div className="space-y-4">
            {[
              { icon: "🔑", color: "rgba(99,102,241,0.35)", label: "Secure OTP Verification", desc: "One-time token, never reused" },
              { icon: "⏱️", color: "rgba(6,182,212,0.3)", label: "15-Minute Reset Expiry", desc: "Short window keeps you safe" },
              { icon: "🫥", color: "rgba(167,139,250,0.3)", label: "Hidden Account Lookup", desc: "We never reveal if an account exists" },
            ].map(({ icon, color, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl flex-shrink-0"
                  style={{ background: color }}>
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#e0e7ff" }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(199,210,254,0.7)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="w-1/2 flex items-center justify-center px-10">

        <div className="w-full max-w-md">

          {/* top navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back to login
            </button>

          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900">Forgot Password 🔓</h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                    Email address
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-400">
                    <Mail size={16} className="text-gray-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Email ID"
                      className="w-full outline-none text-sm bg-transparent"
                    />
                  </div>

                  {fieldError && (
                    <p className="mt-2 text-xs text-red-500">
                      {fieldError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold transition"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", color: "#fff" }}
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <span>🚀</span>
                  )}
                  Send reset link
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔒 We don't reveal whether an account exists for security reasons.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6 rounded-2xl border bg-green-50 border-green-200"
              >
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldAlert className="text-green-600" size={28} />
                </div>

                <h3 className="text-xl font-bold">Check your inbox</h3>
                <p className="text-sm text-gray-600 mt-2">
                  If an account exists, a reset link has been sent.
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-5 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm"
                >
                  Back to login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} />
    </div>
  );
}