import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const toastStyles = {
  success: {
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/10",
    text: "text-emerald-100",
    icon: <CheckCircle2 size={16} />,
  },
  error: {
    border: "border-rose-500/25",
    bg: "bg-rose-500/10",
    text: "text-rose-100",
    icon: <XCircle size={16} />,
  },
  info: {
    border: "border-sky-500/25",
    bg: "bg-sky-500/10",
    text: "text-sky-100",
    icon: <Info size={16} />,
  },
};

export default function Toast({ open, message, type = "info" }) {
  const style = toastStyles[type] || toastStyles.info;

  return (
    <AnimatePresence>
      {open && message ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border ${style.border} ${style.bg} backdrop-blur-xl shadow-[0_18px_70px_rgba(0,0,0,0.22)]`}
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
              {style.icon}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${style.text}`}>{message}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}