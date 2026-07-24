"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 16, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#3f2a26", marginBottom: 6 };

function SubmitButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 15, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, marginTop: 4, opacity: disabled ? 0.6 : 1 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} disabled={disabled} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Não foi possível processar o pedido.");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <section style={{ maxWidth: 440, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, margin: "0 0 8px", textAlign: "center" }}>Esqueci minha senha</h1>
          <p style={{ color: "#8b7d76", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>
            Informe o e-mail da sua conta e enviaremos um link pra redefinir a senha.
          </p>

          {done ? (
            <p style={{ background: "#e3f0e6", color: "#3d7a4a", borderRadius: 12, padding: "14px 16px", fontSize: 14, textAlign: "center" }}>
              Se esse e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.
            </p>
          ) : (
            <>
              <label style={labelStyle}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />
              {error && <p style={{ color: "#b3554d", fontSize: 13, margin: "0 0 8px" }}>{error}</p>}
              <SubmitButton onClick={submit} disabled={busy}>Enviar link de redefinição</SubmitButton>
            </>
          )}

          <p style={{ textAlign: "center", margin: "20px 0 0" }}>
            <Link href="/conta" style={{ color: "#a07882", fontSize: 13, textDecoration: "underline" }}>
              Voltar para o login
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
