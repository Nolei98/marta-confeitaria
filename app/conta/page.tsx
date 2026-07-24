"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

type User = { name: string; email: string };

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 16, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#3f2a26", marginBottom: 6 };

function LogoutButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { width: "100%", border: "1px solid #eaddd0", background: "#fff", color: "#b3554d", borderRadius: 40, padding: 14, fontWeight: 600, fontSize: 15, cursor: "pointer" },
    { background: "#fbf0f0" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Sair da conta
    </button>
  );
}

function SubmitButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 15, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, marginTop: 12 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

export default function ContaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("martaUser") || "null");
      if (u) setUser(u);
    } catch {}
  }, []);

  const submit = () => {
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (mode === "signup") {
      if (!name.trim()) {
        setError("Preencha seu nome.");
        return;
      }
      if (!acceptedTerms) {
        setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
        return;
      }
      const newUser = { name, email };
      try {
        localStorage.setItem("martaUser", JSON.stringify(newUser));
      } catch {}
      setUser(newUser);
      setError("");
    } else {
      const newUser = { name: email.split("@")[0], email };
      try {
        localStorage.setItem("martaUser", JSON.stringify(newUser));
      } catch {}
      setUser(newUser);
      setError("");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("martaUser");
    } catch {}
    setUser(null);
    setEmail("");
    setPassword("");
    setName("");
  };

  const isSignup = mode === "signup";

  return (
    <>
      <SiteHeader />

      {user ? (
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f6d9dd", display: "grid", placeItems: "center", margin: "0 auto 18px", fontFamily: "'Playfair Display',serif", fontSize: 24, color: "#c1531c", fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 6px" }}>Olá, {user.name}!</h1>
            <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 28px" }}>{user.email}</p>
            <div style={{ textAlign: "left", background: "#f7f1e8", borderRadius: 14, padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, color: "#3f2a26", fontSize: 14, marginBottom: 10 }}>Benefícios da sua conta</div>
              <div style={{ color: "#8b7d76", fontSize: 13, lineHeight: 1.7 }}>
                ✓ Histórico de pedidos salvo
                <br />
                ✓ Promoções e cupons exclusivos
                <br />✓ Notificações por e-mail de novidades
              </div>
            </div>
            <LogoutButton onClick={logout} />
          </div>
        </section>
      ) : (
        <section style={{ maxWidth: 440, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 26, background: "#f7f1e8", borderRadius: 30, padding: 4 }}>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={{ flex: 1, border: "none", padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 600, cursor: "pointer", background: !isSignup ? "#c1531c" : "transparent", color: !isSignup ? "#fff" : "#8b7d76" }}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                style={{ flex: 1, border: "none", padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 600, cursor: "pointer", background: isSignup ? "#c1531c" : "transparent", color: isSignup ? "#fff" : "#8b7d76" }}
              >
                Criar conta
              </button>
            </div>

            {isSignup && (
              <>
                <label style={labelStyle}>Nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" style={inputStyle} />
              </>
            )}

            <label style={labelStyle}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />

            <label style={labelStyle}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, marginBottom: 8 }} />

            {error && <p style={{ color: "#b3554d", fontSize: 13, margin: "6px 0 0" }}>{error}</p>}

            {isSignup && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "18px 0", fontSize: 13, color: "#8b7d76", cursor: "pointer" }}>
                <input type="checkbox" checked={acceptedTerms} onChange={() => setAcceptedTerms((v) => !v)} style={{ marginTop: 2 }} />
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" style={{ color: "#c1531c", textDecoration: "underline" }}>
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" style={{ color: "#c1531c", textDecoration: "underline" }}>
                  Política de Privacidade
                </Link>
                .
              </label>
            )}

            <SubmitButton onClick={submit}>{isSignup ? "Criar conta" : "Entrar"}</SubmitButton>

            <p style={{ textAlign: "center", color: "#8b7d76", fontSize: 12, margin: "20px 0 0" }}>
              Comprar sem login sempre foi possível — a conta é só pra quem quer histórico, promoções e avisos por e-mail.
            </p>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
