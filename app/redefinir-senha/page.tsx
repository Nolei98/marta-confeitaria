"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/Loading";
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

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  const submit = async () => {
    if (!token) {
      setError("Link inválido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
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
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, margin: "0 0 24px", textAlign: "center" }}>Redefinir senha</h1>

          {done ? (
            <>
              <p style={{ background: "#e3f0e6", color: "#3d7a4a", borderRadius: 12, padding: "14px 16px", fontSize: 14, textAlign: "center", margin: "0 0 20px" }}>
                Senha redefinida com sucesso!
              </p>
              <SubmitButton onClick={() => (window.location.href = "/conta")}>Ir para o login</SubmitButton>
            </>
          ) : token === null ? (
            <LoadingScreen compact />
          ) : !token ? (
            <p style={{ color: "#b3554d", fontSize: 14, textAlign: "center" }}>
              Link inválido. <Link href="/esqueci-senha" style={{ color: "#c1531c", textDecoration: "underline" }}>Solicite um novo</Link>.
            </p>
          ) : (
            <>
              <label style={labelStyle}>Nova senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <label style={labelStyle}>Confirmar senha</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle} />
              {error && <p style={{ color: "#b3554d", fontSize: 13, margin: "0 0 8px" }}>{error}</p>}
              <SubmitButton onClick={submit} disabled={busy}>Redefinir senha</SubmitButton>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
