"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

type OrderItem = { id: string; nameSnapshot: string; priceSnapshot: string; qty: number };
type Order = { id: string; code: string; status: string; total: string; createdAt: string; items: OrderItem[] };
type Log = { id: string; action: string; meta: unknown; createdAt: string };

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 16, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#3f2a26", marginBottom: 6 };

const ACTION_LABELS: Record<string, string> = {
  REGISTER: "Conta criada",
  LOGIN: "Login realizado",
  ADD_TO_CART: "Item adicionado ao carrinho",
  REMOVE_FROM_CART: "Item removido do carrinho",
  CHECKOUT: "Pedido finalizado",
};

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

function SubmitButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 15, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, marginTop: 12, opacity: disabled ? 0.6 : 1 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} disabled={disabled} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

export default function ContaPage() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders").then((r) => r.json()).then((data) => Array.isArray(data) && setOrders(data)).catch(() => {});
    fetch("/api/logs").then((r) => r.json()).then((data) => Array.isArray(data) && setLogs(data)).catch(() => {});
  }, [status]);

  const isSignup = mode === "signup";

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isSignup) {
        if (!name.trim()) {
          setError("Preencha seu nome.");
          return;
        }
        if (!acceptedTerms) {
          setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
          return;
        }
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Não foi possível criar a conta.");
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <>
        <SiteHeader />
        <section style={{ padding: "120px 24px", textAlign: "center", color: "#8b7d76" }}>Carregando...</section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      {session?.user ? (
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f6d9dd", display: "grid", placeItems: "center", margin: "0 auto 18px", fontFamily: "'Playfair Display',serif", fontSize: 24, color: "#c1531c", fontWeight: 700 }}>
              {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 6px" }}>Olá, {session.user.name}!</h1>
            <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 28px" }}>{session.user.email}</p>
            <LogoutButton onClick={() => signOut({ callbackUrl: "/" })} />
          </div>

          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, marginBottom: 24, textAlign: "left" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Histórico de pedidos</h2>
            {orders.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Nenhum pedido ainda.</p>}
            {orders.map((o) => (
              <div key={o.id} style={{ borderTop: "1px solid #eaddd0", padding: "12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#3f2a26", fontSize: 14 }}>
                  <span>{o.code}</span>
                  <span>R$ {Number(o.total).toFixed(2).replace(".", ",")}</span>
                </div>
                <div style={{ fontSize: 13, color: "#8b7d76", margin: "4px 0" }}>
                  {o.items.map((i) => `${i.qty}x ${i.nameSnapshot}`).join(" · ")}
                </div>
                <div style={{ fontSize: 12, color: "#a07882" }}>{o.status} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, textAlign: "left" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Atividade da conta</h2>
            {logs.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Sem atividade registrada.</p>}
            {logs.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eaddd0", padding: "10px 0", fontSize: 13 }}>
                <span style={{ color: "#3f2a26" }}>{ACTION_LABELS[l.action] || l.action}</span>
                <span style={{ color: "#a07882" }}>{new Date(l.createdAt).toLocaleString("pt-BR")}</span>
              </div>
            ))}
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

            <SubmitButton onClick={submit} disabled={busy}>{isSignup ? "Criar conta" : "Entrar"}</SubmitButton>

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
