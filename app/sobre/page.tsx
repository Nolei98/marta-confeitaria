"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useCustomerGate } from "@/lib/useCustomerGate";
import { LoadingScreen } from "@/components/ui/Loading";
import grid from "@/styles/grid.module.css";
import { HeartIcon, LeafIcon, MapPinIcon } from "@/components/icons";

const VALUES = [
  { title: "Afeto em cada fatia", desc: "Cozinhamos como se fosse para nossa própria família, com tempo e cuidado.", bg: "#e6dcef", color: "#7d52a8", Icon: HeartIcon },
  { title: "Ingredientes de verdade", desc: "Sem atalhos: manteiga, ovos e frutas frescas em cada receita.", bg: "#f6d9dd", color: "#c1531c", Icon: LeafIcon },
  { title: "Perto de quem pede", desc: "Atendimento próximo, do pedido até a entrega na sua porta.", bg: "#f3e2cf", color: "#d49a37", Icon: MapPinIcon },
];

const STATS = [
  { num: "8", label: "anos de história" },
  { num: "9", label: "sabores de fatia" },
  { num: "100%", label: "caseiro" },
];

export default function SobrePage() {
  const blocking = useCustomerGate();

  if (blocking) {
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

      <section className={grid.twoCol} style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 24px 24px", gap: 48, alignItems: "center" }}>
        <div>
          <div className={grid.eyebrow} style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 14 }}>Nossa história</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,40px)", margin: "0 0 18px", lineHeight: 1.15 }}>
            De uma cozinha de casa para o bairro inteiro
          </h1>
          <p style={{ color: "#8b7d76", fontSize: 16, margin: "0 0 14px" }}>
            Tudo começou com a Marta assando bolos para vizinhos e amigos nos fins de semana. O que era um carinho virou pedido, e o pedido virou rotina — sempre com a mesma receita de família e o mesmo cuidado do primeiro dia.
          </p>
          <p style={{ color: "#8b7d76", fontSize: 16, margin: "0 0 30px" }}>
            Hoje seguimos fazendo tudo à mão, em pequenas quantidades, pra garantir que cada fatia saia da nossa cozinha com o mesmo capricho de sempre.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, textAlign: "center" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, color: "#c1531c", fontWeight: 700, lineHeight: 1 }}>{s.num}</div>
                <div style={{ color: "#8b7d76", fontSize: 13, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/scene-13.webp" alt="Mãos decorando um bolo na cozinha da Marta" style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 24 }} loading="lazy" decoding="async" />
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/scene-14.webp" alt="Ambiente da cozinha da Marta Confeitaria" style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 24 }} loading="lazy" decoding="async" />
      </section>

      <section style={{ padding: "72px 24px", maxWidth: 1160, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, textAlign: "center", margin: "0 0 40px" }}>Nossos valores</h2>
        <div className={grid.threeCol} style={{ gap: 24 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 28 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: v.bg, marginBottom: 14, display: "grid", placeItems: "center", color: v.color }}>
                <v.Icon />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, margin: "0 0 8px", color: "#c1531c" }}>{v.title}</h3>
              <p style={{ color: "#8b7d76", fontSize: 14, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
