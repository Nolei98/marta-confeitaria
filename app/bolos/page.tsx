"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { EncomendaForm } from "@/components/account/EncomendaForm";
import { useCustomerGate } from "@/lib/useCustomerGate";
import grid from "@/styles/grid.module.css";

export default function BolosPage() {
  useCustomerGate("/conta?view=encomenda");

  return (
    <>
      <SiteHeader />

      <section style={{ padding: "64px 24px 20px", maxWidth: 1160, margin: "0 auto", textAlign: "center" }}>
        <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
          Festa · Aniversário · Celebração
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(32px,4.6vw,44px)", letterSpacing: ".05em", textTransform: "uppercase", color: "#3f2a26", margin: "0 0 14px" }}>
          Bolos inteiros
        </h1>
        <p style={{ color: "#8b7d76", maxWidth: 520, margin: "0 auto 40px", fontFamily: "var(--font-body)" }}>
          Perfeitos para aniversários, festas e comemorações especiais. Escolha o modelo e monte seu pedido.
        </p>
      </section>

      <div style={{ padding: "0 24px", maxWidth: 1160, margin: "0 auto" }}>
        <EncomendaForm />
      </div>

      <Footer />
    </>
  );
}
