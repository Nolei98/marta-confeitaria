"use client";

import { useEffect, useState } from "react";

const COOLDOWN_SECONDS = 20;

export function VerifyEmailBanner() {
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const resend = async () => {
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível reenviar o e-mail.");
        return;
      }
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: "#fdf3e2", border: "1px solid #eecf8e", borderRadius: 14, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div style={{ fontSize: 13, color: "#7a5c1e", lineHeight: 1.5 }}>
        <strong>Confirme seu e-mail.</strong> Enviamos um link de confirmação — verifique também a caixa de spam.
        {sent && <div style={{ color: "#3d7a4a", marginTop: 4 }}>E-mail reenviado!</div>}
        {error && <div style={{ color: "#a05353", marginTop: 4 }}>{error}</div>}
      </div>
      <button
        onClick={resend}
        disabled={busy || cooldown > 0}
        style={{
          border: "1px solid #eecf8e",
          background: "#fff",
          color: "#a07a2a",
          borderRadius: 30,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: busy || cooldown > 0 ? "default" : "pointer",
          opacity: busy || cooldown > 0 ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar e-mail"}
      </button>
    </div>
  );
}
