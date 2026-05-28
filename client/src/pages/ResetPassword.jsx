import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, FileText, Lock, LoaderCircle, ShieldCheck } from "lucide-react";
import Toast from "../components/Toast";
import { confirmPasswordReset } from "../services/passwordResetApi";

const minLength = 6;

const getStrengthScore = (password) => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState({ password: false, confirmPassword: false });
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });

  useEffect(() => {
    if (!toast.open) return undefined;
    const timer = setTimeout(() => setToast((current) => ({ ...current, open: false })), 3200);
    return () => clearTimeout(timer);
  }, [toast.open]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 2200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success, navigate]);

  const showToast = (message, type = "info") => setToast({ open: true, message, type });

  const passwordStrength = useMemo(() => getStrengthScore(form.password), [form.password]);
  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const passwordTooShort = form.password.length > 0 && form.password.length < minLength;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.password || !form.confirmPassword) {
      showToast("Both password fields are required.", "error");
      return;
    }

    if (form.password.length < minLength) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const { response, data } = await confirmPasswordReset({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.ok) {
        setSuccess(true);
        showToast(data.msg || "Password reset successful.", "success");
      } else {
        showToast(data.msg || "Unable to reset password.", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast("Unable to reach the server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Excellent"][passwordStrength] || "Weak";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 text-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.12),transparent_22%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.1),transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
      <motion.div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl" animate={{ y: [0, 14, 0] }} transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute left-[-6rem] bottom-8 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" animate={{ y: [0, -18, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative z-10 flex min-h-screen w-full">
        <div className="grid w-full lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-screen flex-col justify-between overflow-hidden p-8"
            style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 30%,#4338ca 60%,#6366f1 85%,#818cf8 100%)" }}
          >
            {/* Blobs */}
            <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full blur-[55px]"
              style={{ background: "radial-gradient(circle,rgba(99,102,241,0.45),transparent 70%)" }} />
            <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full blur-[55px]"
              style={{ background: "radial-gradient(circle,rgba(6,182,212,0.3),transparent 70%)" }} />
            <div className="absolute bottom-1/3 right-10 w-40 h-40 rounded-full blur-[35px]"
              style={{ background: "radial-gradient(circle,rgba(167,139,250,0.4),transparent 70%)" }} />

            {/* Grid overlay */}
            <div className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
                backgroundSize: "38px 38px"
              }} />

            {/* Secure badge */}
            <div className="absolute top-5 right-5 text-[11px] font-bold px-4 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#c7d2fe", letterSpacing: ".5px" }}>
              🔐 Secure Reset
            </div>

            {/* Top: Logo + headline */}
            <div className="relative z-10">
              <div className="mb-7 flex items-center gap-2 text-[24px] font-extrabold tracking-[-0.04em] leading-none text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] flex-shrink-0">
                  <FileText size={18} color="#fff" />
                </div>
                <span>
                  Invo<span style={{ color: "var(--accent)" }}>Mate</span>
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight xl:text-5xl mb-4"
                style={{ color: "#fff", letterSpacing: "-1.5px" }}>
                Set a new<br />
                <span style={{ color: "#c7d2fe" }}>password</span> &<br />
                stay protected
              </h1>

              <p className="text-sm leading-7" style={{ color: "rgba(199,210,254,0.85)" }}>
                Once updated, the reset token cannot be reused and older JWTs will be rejected on the next protected route. 🔒
              </p>
            </div>

            {/* Bottom: Feature cards */}
            <div className="relative z-10 mt-8 flex flex-col gap-3">
              {[
                { icon: "🪙", color: "rgba(99,102,241,0.35)",  label: "Hidden Token Verification", desc: "Token never exposed in response" },
                { icon: "🎫", color: "rgba(6,182,212,0.3)",    label: "One-Time Use Only",          desc: "Link invalidated immediately after use" },
                { icon: "🍪", color: "rgba(167,139,250,0.3)",  label: "JWT Cookie Invalidated",     desc: "Old sessions can't access protected routes" },
                { icon: "⚡", color: "rgba(16,185,129,0.25)",  label: "Fast Login Redirect",        desc: "Seamlessly sent to login on success" },
              ].map(({ icon, color, label, desc }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-10"
          >
            <div className="w-full max-w-md">
              <div className="mb-6 flex items-center justify-between">
                <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900">
                  <ArrowLeft size={16} /> Back to login
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-[-0.06em] text-gray-900">Reset Password 🔑</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Choose a strong new password. The reset link is single-use and expires quickly.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.form
                    key="reset-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">New password</label>
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                        <Lock size={16} className="text-gray-400" />
                        <input
                          value={form.password}
                          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                          type={visible.password ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Enter a new password"
                          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        />
                        <button type="button" onClick={() => setVisible((current) => ({ ...current, password: !current.password }))} className="text-gray-400 transition hover:text-gray-700">
                          {visible.password ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Password strength</span>
                        <span>{strengthLabel}</span>
                      </div>
                      {passwordTooShort ? <p className="mt-2 text-xs text-rose-600">Password must be at least 6 characters long.</p> : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">Confirm password</label>
                      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                        <ShieldCheck size={16} className="text-gray-400" />
                        <input
                          value={form.confirmPassword}
                          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                          type={visible.confirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Confirm your password"
                          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        />
                        <button type="button" onClick={() => setVisible((current) => ({ ...current, confirmPassword: !current.confirmPassword }))} className="text-gray-400 transition hover:text-gray-700">
                          {visible.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordMismatch ? <p className="mt-2 text-xs text-rose-600">Passwords do not match.</p> : null}
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", color: "#fff" }}
                    >
                      {loading ? <LoaderCircle size={18} className="animate-spin" /> : <span>🔄</span>}
                      Update password
                    </button>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      Keep it long, unique, and hard to guess. Avoid reusing passwords from other services.
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="reset-success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <ShieldCheck size={30} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Password updated</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      You will be redirected to the login screen shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} />
    </div>
  );
}