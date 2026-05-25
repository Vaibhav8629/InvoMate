import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import NotificationBell from "./NotificationBell";

export const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: "🏠" },
  { label: "New Invoice", path: "/createbill", icon: "🧾" },
  { label: "Invoices", path: "/invoices", icon: "📄" },
  { label: "Products", path: "/products", icon: "📦" },
  { label: "Profile", path: "/profile", icon: "⚙️" },
];

const isActivePath = (current, target) => {
  if (current === target) return true;
  return current.startsWith(`${target}/`);
};

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const ownerName = user?.username || "";

  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "var(--text-primary)",
        zIndex: 20,
      }}
    >
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(99,102,241,.1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              background: "linear-gradient(135deg,#818cf8,#6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            InvoMate
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user?._id && (
              <div style={{ color: "#9ca3af" }}>
                <NotificationBell userId={user._id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.path);
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                marginBottom: 4,
                background: active ? "rgba(99,102,241,.18)" : "transparent",
                color: active ? "#818cf8" : "#6b7280",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {onLogout ? (
        <div style={{ padding: "16px 12px 0", borderTop: "1px solid rgba(99,102,241,.1)" }}>
          {ownerName ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(99,102,241,.08)",
                border: "1px solid rgba(99,102,241,.2)",
                color: "#e2e8f0",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase" }}>
                Account Owner
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{ownerName}</div>
            </div>
          ) : null}
          <div
            onClick={onLogout}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              background: "rgba(239,68,68,.08)",
              border: "1px solid rgba(239,68,68,.2)",
              color: "#f87171",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            🚪 Logout
          </div>
        </div>
      ) : null}
    </aside>
  );
}
