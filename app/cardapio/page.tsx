"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { useHoverStyle } from "@/lib/useHover";
import { useCustomerGate } from "@/lib/useCustomerGate";
import { LoadingScreen } from "@/components/ui/Loading";
import grid from "@/styles/grid.module.css";
import { formatBRL } from "@/lib/format";

type DbProduct = { id: string; name: string; category: string; price: number; imageUrl: string | null; stock: number | null };

const PEDESTAL_COLORS = ["#f6d9dd", "#e6dcef", "#f3e2cf"];
const LINE_COLORS = ["#c1531c", "#7d52a8", "#d49a37"];
const FALLBACK_SLICE_IMG = "/images/slice-chocolate.webp";
const FALLBACK_CAKE_IMG = "/images/cake-10.jpg";
const FALLBACK_TAG = "Feito na hora";

// There is deliberately no hardcoded fallback catalogue here. A made-up
// catalogue is worse than no catalogue: it is indistinguishable from the real
// one, and every item in it leads to an order the server cannot honour.

function EmptyNotice({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8b7d76", fontFamily: "var(--font-body)", fontSize: 15, margin: "40px 0" }}>
      {children}
    </p>
  );
}

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
  return <img src={src} alt={alt} {...hover.handlers} style={hover.style} loading="lazy" decoding="async" />;
}

function AddButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const hover = useHoverStyle(
    { border: "none", background: "#c1531c", color: "#fff", fontSize: 16, cursor: "pointer", width: 32, height: 32, borderRadius: "50%", transition: "transform .2s ease, background-color .2s ease" },
    { background: "#8a6470", transform: "scale(1.18)" }
  );
  if (disabled) {
    return (
      <button disabled aria-label="Esgotado" style={{ ...hover.style, background: "#c9beb5", cursor: "not-allowed" }}>
        +
      </button>
    );
  }
  return (
    <button onClick={onClick} aria-label="Adicionar" {...hover.handlers} style={hover.style}>
      +
    </button>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: "13px 30px", fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, fontFamily: "var(--font-body)" },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Tentar de novo
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
  const blocking = useCustomerGate();
  const [filter, setFilter] = useState<"fatias" | "bolos">("fatias");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const { addToCart } = useCart();

  const loadProducts = useCallback(() => {
    setLoadState("loading");
    fetch("/api/public/products")
      .then((r) => {
        if (!r.ok) throw new Error("catálogo indisponível");
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("resposta inesperada");
        setProducts(data);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(loadProducts, [loadProducts]);

  const SLICES = products
    .filter((p) => p.category === "Fatia")
    .map((p, i) => ({
      name: p.name,
      price: formatBRL(p.price),
      priceNum: p.price,
      img: p.imageUrl || FALLBACK_SLICE_IMG,
      tag: FALLBACK_TAG,
      cardBg: PEDESTAL_COLORS[i % PEDESTAL_COLORS.length],
      lineColor: LINE_COLORS[i % LINE_COLORS.length],
      soldOut: p.stock === 0,
    }));

  const CAKE_MODELS = products
    .filter((p) => p.category === "Bolo inteiro")
    .map((p) => ({ name: p.name, desc: "Sob encomenda, personalizável.", img: p.imageUrl || FALLBACK_CAKE_IMG, price: "A partir de " + formatBRL(p.price) }));

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

      <section style={{ padding: "64px 24px 20px", maxWidth: 1160, margin: "0 auto", textAlign: "center" }}>
        <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
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

      {loadState === "loading" && <LoadingScreen />}

      {loadState === "error" && (
        <section style={{ padding: "24px 24px 100px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#8b7d76", fontFamily: "var(--font-body)", fontSize: 15, margin: "0 0 20px" }}>
            Não conseguimos carregar o cardápio agora. Pode ser uma instabilidade passageira.
          </p>
          <RetryButton onClick={loadProducts} />
        </section>
      )}

      {loadState === "ready" && filter === "fatias" && (
        <section style={{ padding: "24px 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
          <div className={grid.threeCol} style={{ gap: "40px 32px" }}>
            {SLICES.length === 0 && <EmptyNotice>Nenhuma fatia disponível no momento. Volte logo mais!</EmptyNotice>}
            {SLICES.map((s) => (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", background: s.cardBg, borderRadius: 14, padding: "76px 20px 22px", marginTop: 64 }}>
                  {s.soldOut && (
                    <div style={{ position: "absolute", top: 14, left: 14, lineHeight: 1, color: "#8b7d76", zIndex: 3, padding: "5px 7px", border: "1.5px solid #8b7d76", borderRadius: 6, background: "#fff" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em" }}>Esgotado</span>
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
                  <AddButton onClick={() => addToCart(s.name, s.priceNum)} disabled={s.soldOut} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loadState === "ready" && filter === "bolos" && (
        <section style={{ padding: "24px 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
          <div className={grid.threeCol} style={{ gap: 32 }}>
            {CAKE_MODELS.length === 0 && <EmptyNotice>Nenhum modelo de bolo cadastrado no momento. Fale com a gente pelo WhatsApp!</EmptyNotice>}
            {CAKE_MODELS.map((m) => (
              <div key={m.name} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} style={{ width: "100%", height: 210, objectFit: "cover" }} loading="lazy" decoding="async" />
                <div style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: "0 0 8px", color: "#3f2a26", lineHeight: 1.2, letterSpacing: ".02em" }}>{m.name}</h3>
                  <p style={{ fontSize: 14, color: "#8b7d76", margin: "0 0 16px", fontFamily: "var(--font-body)" }}>{m.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#3f2a26", fontWeight: 600 }}>{m.price}</span>
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
