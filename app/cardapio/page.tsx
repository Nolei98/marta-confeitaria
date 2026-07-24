"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { useHoverStyle } from "@/lib/useHover";

const PEDESTAL_COLORS = ["#f6d9dd", "#e6dcef", "#f3e2cf"];
const LINE_COLORS = ["#c1531c", "#7d52a8", "#d49a37"];

const SLICES = [
  { name: "Chocolate intenso", price: "R$ 12,00", priceNum: 12, img: "/images/slice-chocolate.webp", badge: "Mais pedida", tag: "Cacau 70% · Callebaut" },
  { name: "Red velvet", price: "R$ 14,00", priceNum: 14, img: "/images/slice-red-velvet.webp", badge: "", tag: "Cream cheese tradicional" },
  { name: "Cenoura com chocolate", price: "R$ 10,00", priceNum: 10, img: "/images/slice-cenoura.webp", badge: "", tag: "Cobertura fofinha" },
  { name: "Prestígio", price: "R$ 13,00", priceNum: 13, img: "/images/slice-prestigio.webp", badge: "", tag: "Coco ralado fresco" },
  { name: "Ninho com Nutella", price: "R$ 15,00", priceNum: 15, img: "/images/slice-ninho.webp", badge: "Novidade", tag: "Leite Ninho cremoso" },
  { name: "Limão siciliano", price: "R$ 12,00", priceNum: 12, img: "/images/slice-limao.webp", badge: "", tag: "Toque cítrico suave" },
  { name: "Floresta negra", price: "R$ 16,00", priceNum: 16, img: "/images/slice-floresta-negra.webp", badge: "", tag: "Cerejas selecionadas" },
  { name: "Maracujá", price: "R$ 12,00", priceNum: 12, img: "/images/slice-maracuja.webp", badge: "", tag: "Calda de fruta natural" },
  { name: "Fubá cremoso", price: "R$ 9,00", priceNum: 9, img: "/images/slice-fuba.webp", badge: "", tag: "Erva-doce e queijo" },
].map((s, i) => ({ ...s, cardBg: PEDESTAL_COLORS[i % PEDESTAL_COLORS.length], lineColor: LINE_COLORS[i % LINE_COLORS.length] }));

const CAKE_MODELS = [
  { name: "Bolo de aniversário", desc: "Chantilly, frutas vermelhas e velinhas.", img: "/images/cake-10.jpg" },
  { name: "Bolo de festa", desc: "Andares em tons pastel com rosas de açúcar.", img: "/images/cake-11.webp" },
  { name: "Bolo temático", desc: "Chocolate coberto de rosas, personalizável.", img: "/images/cake-12.jpg" },
];

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? "none" : "1px solid #eaddd0",
        padding: "11px 22px",
        borderRadius: 30,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        background: active ? "#c1531c" : "#fff",
        color: active ? "#fff" : "#8b7d76",
      }}
    >
      {children}
    </button>
  );
}

function SliceImg({ src, alt }: { src: string; alt: string }) {
  const hover = useHoverStyle(
    { position: "absolute", top: -64, left: "50%", transform: "translateX(-50%)", height: 150, objectFit: "contain", filter: "drop-shadow(0 20px 16px rgba(58,33,28,.28))", transition: "transform .28s ease-out", zIndex: 2 },
    { transform: "translateX(-50%) translateY(-8px) scale(1.06)" }
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...hover.handlers} style={hover.style} />;
}

function AddButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { border: "none", background: "#c1531c", color: "#fff", fontSize: 16, cursor: "pointer", width: 32, height: 32, borderRadius: "50%", transition: "transform .2s ease, background-color .2s ease" },
    { background: "#8a6470", transform: "scale(1.18)" }
  );
  return (
    <button onClick={onClick} aria-label="Adicionar" {...hover.handlers} style={hover.style}>
      +
    </button>
  );
}

function EncomendarLink() {
  const hover = useHoverStyle(
    { background: "#c1531c", color: "#fff", borderRadius: 30, padding: "9px 16px", fontWeight: 600, fontSize: 13, fontFamily: "var(--font-body)" },
    { background: "#9c3f14" }
  );
  return (
    <Link href="/bolos" {...hover.handlers} style={hover.style}>
      Encomendar
    </Link>
  );
}

export default function CardapioPage() {
  const [filter, setFilter] = useState<"fatias" | "bolos">("fatias");
  const { addToCart } = useCart();

  return (
    <>
      <SiteHeader />

      <section style={{ padding: "64px 24px 20px", maxWidth: 1160, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
          Fatia · Sabor · Afeto
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(32px,4.6vw,44px)", letterSpacing: ".05em", textTransform: "uppercase", color: "#3f2a26", margin: "0 0 14px" }}>
          Fatias e bolos inteiros
        </h1>
        <p style={{ color: "#8b7d76", maxWidth: 520, margin: "0 auto 28px", fontFamily: "var(--font-body)" }}>
          Escolha entre nossas fatias individuais ou um bolo inteiro sob encomenda.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 }}>
          <FilterButton active={filter === "fatias"} onClick={() => setFilter("fatias")}>Fatias</FilterButton>
          <FilterButton active={filter === "bolos"} onClick={() => setFilter("bolos")}>Bolos inteiros</FilterButton>
        </div>
      </section>

      {filter === "fatias" && (
        <section style={{ padding: "24px 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "40px 32px" }}>
            {SLICES.map((s) => (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", background: s.cardBg, borderRadius: 14, padding: "76px 20px 22px", marginTop: 64 }}>
                  {s.badge && (
                    <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, color: "#c1531c", zIndex: 3, padding: "4px 6px", border: "1.5px solid #c1531c", borderRadius: 6, background: "#fff" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", maxWidth: 44, textAlign: "center" }}>{s.badge}</span>
                      <span style={{ fontSize: 11, marginTop: 1 }}>★</span>
                    </div>
                  )}
                  <SliceImg src={s.img} alt={s.name} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, lineHeight: 1.2, color: "#3f2a26", textAlign: "center", marginTop: 14, letterSpacing: ".02em" }}>
                    {s.name}
                  </div>
                  <div style={{ width: 36, height: 2, background: s.lineColor, margin: "12px auto" }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#8a6470", margin: 0 }}>{s.tag}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#3f2a26", fontWeight: 600 }}>{s.price}</span>
                  <AddButton onClick={() => addToCart(s.name, s.priceNum)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {filter === "bolos" && (
        <section style={{ padding: "24px 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
            {CAKE_MODELS.map((m) => (
              <div key={m.name} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} style={{ width: "100%", height: 210, objectFit: "cover" }} />
                <div style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: "0 0 8px", color: "#3f2a26", lineHeight: 1.2, letterSpacing: ".02em" }}>{m.name}</h3>
                  <p style={{ fontSize: 14, color: "#8b7d76", margin: "0 0 16px", fontFamily: "var(--font-body)" }}>{m.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#3f2a26", fontWeight: 600 }}>A partir de R$ 75,00</span>
                    <EncomendarLink />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: "0 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ background: "#3f2a26", borderRadius: 26, padding: "44px 40px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 8px" }}>Quer um bolo inteiro?</h2>
            <p style={{ color: "rgba(255,255,255,.8)", margin: 0, maxWidth: 420 }}>Fazemos bolos sob encomenda nos tamanhos P, M e G — ideais pra festas e comemorações.</p>
          </div>
          <Link href="/bolos" style={{ background: "#fff", color: "#c1531c", borderRadius: 40, padding: "14px 28px", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>
            Ver bolos inteiros
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
