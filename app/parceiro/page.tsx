"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { VerifyEmailBanner } from "@/components/account/VerifyEmailBanner";
import { LoadingScreen } from "@/components/ui/Loading";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

type Log = { id: string; action: string; meta: unknown; createdAt: string };
type SalesPoint = { id: string; name: string; address: string };

const ACTION_LABELS: Record<string, string> = {
  REGISTER: "Conta criada",
  LOGIN: "Login realizado",
  ADD_TO_CART: "Item adicionado ao carrinho",
  REMOVE_FROM_CART: "Item removido do carrinho",
  CHECKOUT: "Pedido finalizado",
  PASSWORD_RESET: "Senha redefinida",
  PAYMENT_APPROVED: "Pagamento aprovado",
};

function LogoutButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { border: "1px solid #eaddd0", background: "#fff", color: "#b3554d", borderRadius: 40, padding: "12px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
    { background: "#fbf0f0" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Sair da conta
    </button>
  );
}

export default function ParceiroPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [points, setPoints] = useState<SalesPoint[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/logs").then((r) => r.json()).then((data) => Array.isArray(data) && setLogs(data)).catch(() => {});
    fetch("/api/public/sales-points").then((r) => r.json()).then((data) => Array.isArray(data) && setPoints(data)).catch(() => {});
  }, [status]);

  if (status === "loading") {
    return (
      <>
        <SiteHeader />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 28, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className={grid.eyebrow} style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 8 }}>
              Área do parceiro
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 4px" }}>Olá, {session?.user?.name}!</h1>
            <p style={{ color: "#8b7d76", fontSize: 14, margin: 0 }}>{session?.user?.email}</p>
          </div>
          <LogoutButton onClick={() => signOut({ callbackUrl: "/" })} />
        </div>

        {!session?.user?.emailConfirmed && <VerifyEmailBanner />}

        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 8px", color: "#c1531c" }}>Sobre a parceria</h2>
          <p style={{ color: "#8b7d76", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Como ponto de venda parceiro, você revende as fatias e bolos da Marta no seu estabelecimento.
            Para dúvidas sobre reposição, condições comerciais ou pedidos maiores, fale direto com a gente pelo WhatsApp.
          </p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Pontos de venda cadastrados</h2>
          {points.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Nenhum ponto cadastrado ainda.</p>}
          {points.map((p) => (
            <div key={p.id} style={{ borderTop: "1px solid #eaddd0", padding: "12px 0" }}>
              <div style={{ fontWeight: 600, color: "#3f2a26", fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "#8b7d76" }}>{p.address}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Atividade da conta</h2>
          {logs.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Sem atividade registrada.</p>}
          {logs.map((l) => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eaddd0", padding: "10px 0", fontSize: 13 }}>
              <span style={{ color: "#3f2a26" }}>{ACTION_LABELS[l.action] || l.action}</span>
              <span style={{ color: "#a07882" }}>{new Date(l.createdAt).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
