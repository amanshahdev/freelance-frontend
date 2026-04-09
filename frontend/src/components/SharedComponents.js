/**
 * components/StatCard.js
 */
import React from "react";
import Navbar from "./Navbar";

export function StatCard({ icon, label, value, accent = false }) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderColor: accent ? "rgba(20,184,166,0.3)" : undefined,
        background: accent ? "rgba(20,184,166,0.05)" : undefined,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-md)",
          background: accent ? "var(--amber-dim)" : "var(--bg-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent ? "var(--amber)" : "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: accent ? "var(--amber)" : "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * components/PageHeader.js
 */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 32,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 400,
            color: "var(--text-primary)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/**
 * components/LoadingSpinner.js
 */
export function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        gap: 16,
      }}
    >
      <div className="spinner spinner-lg" />
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{message}</p>
    </div>
  );
}

/**
 * components/Pagination.js
 */
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        marginTop: 32,
        flexWrap: "wrap",
      }}
    >
      <button
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            style={{ padding: "6px 4px", color: "var(--text-muted)" }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            className="btn btn-sm"
            style={{
              background: p === page ? "var(--amber)" : "var(--bg-raised)",
              color: p === page ? "#FFFFFF" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              minWidth: 36,
            }}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}

/**
 * components/EmptyState.js
 */
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: 48, opacity: 0.25 }}>{icon}</div>}
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          color: "var(--text-secondary)",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 360 }}>
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

/**
 * components/DashboardLayout.js
 * Shared layout wrapper for dashboard pages with navbar + content area.
 */

export function DashboardLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 24px",
          minHeight: "calc(100vh - var(--nav-h))",
        }}
      >
        {children}
      </main>
    </div>
  );
}

/**
 * components/ConfirmModal.js
 */
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  dangerous = false,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(241,245,249,0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
          {title}
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: 12,
            fontSize: 15,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 24,
            justifyContent: "flex-end",
          }}
        >
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${dangerous ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
