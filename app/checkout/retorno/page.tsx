"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/Loading";

type Status = "success" | "pending" | "failure" | null;

const COPY: Record<Exclude<Status, null>, { title: string; text: string; bg: string; color: string }> = {
  success: {
    title: "Pagamento aprovado!",
    text: "Recebemos seu pedido e o pagamento foi confirmado. Já vamos começar a preparar.",
    bg: "#e3f0e6",
    color: "#3d7a4a",
  },
  pending: {
    title: "Pagamento em análise",
    text: "Seu pedido foi registrado e o pagamento está sendo processado. Assim que for aprovado, avisamos.",
    bg: "#fdf3e2",
    color: "#a07a2a",
  },
  failure: {
    title: "Pagamento não aprovado",
    text: "Não conseguimos confirmar o pagamento desse pedido. Você pode tentar novamente.",
    bg: "#f2e4e4",
    color: "#a05353",
  },
};

export default function CheckoutRetornoPage() {
  const [status, setStatus] = useState<Status>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s === "success" || s === "pending" || s === "failure") setStatus(s);
    setCode(params.get("code") || "");
  }, []);

  const copy = status ? COPY[status] : null;

  return (
    <>
      <SiteHeader />
      <section style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px 100px", textAlign: "center" }}>
        {copy ? (
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: "40px 28px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: copy.bg, color: copy.color, display: "grid", placeItems: "center", margin: "0 auto 18px", fontSize: 28 }}>
              {status === "success" ? "✓" : status === "pending" ? "…" : "!"}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, margin: "0 0 10px", color: copy.color }}>{copy.title}</h1>
            <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 6px" }}>{copy.text}</p>
            {code && <p style={{ color: "#a07882", fontSize: 13, margin: "0 0 24px" }}>Pedido {code}</p>}
            <Link href="/conta" style={{ display: "inline-block", background: "#c1531c", color: "#fff", borderRadius: 30, padding: "12px 26px", fontWeight: 600, fontSize: 14, marginTop: 10 }}>
              Ver meus pedidos
            </Link>
          </div>
        ) : (
          <LoadingScreen compact />
        )}
      </section>
      <Footer />
    </>
  );
}
