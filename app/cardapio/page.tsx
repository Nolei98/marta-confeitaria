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
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";

type DbProduct = { id: string; name: string; category: string; price: number; imageUrl: string | null; stock: number | null };

const PEDESTAL_COLORS = ["#f6d9dd", "#e6dcef", "#f3e2cf"];
const LINE_COLORS = ["#c1531c", "#7d52a8", "#d49a37"];
const FALLBACK_SLICE_IMG = "/images/slice-chocolate.webp";
const FALLBACK_CAKE_IMG = "/images/cake-10.jpg";
const FALLBACK_TAG = "Feito na hora";
/** A partir daqui o card avisa que está acabando. */
const LOW_STOCK = 3;

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
  const [query, setQuery] = useState("");
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

  // Busca sem acento e sem caixa: "limao" acha "Limão siciliano".
  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const term = normalize(query.trim());
  const matches = (name: string) => !term || normalize(name).includes(term);

  const SLICES = products
    .filter((p) => p.category === "Fatia" && matches(p.name))
    .map((p, i) => ({
      id: p.id,
      name: p.name,
      price: formatBRL(p.price),
      priceNum: p.price,
      img: p.imageUrl || FALLBACK_SLICE_IMG,
      tag: FALLBACK_TAG,
      cardBg: PEDESTAL_COLORS[i % PEDESTAL_COLORS.length],
      lineColor: LINE_COLORS[i % LINE_COLORS.length],
      soldOut: p.stock === 0,
      // Estoque baixo é informação de venda: avisa que está acabando sem
      // expor o número exato quando ainda há bastante. `null` é estoque não
      // controlado e nunca vira aviso.
      lastUnits: p.stock !== null && p.stock > 0 && p.stock <= LOW_STOCK,
      left: p.stock,
    }));

  const CAKE_MODELS = products
    .filter((p) => p.category === "Bolo inteiro" && matches(p.name))
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
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
          <FilterButton active={filter === "fatias"} onClick={() => setFilter("fatias")}>Fatias</FilterButton>
          <FilterButton active={filter === "bolos"} onClick={() => setFilter("bolos")}>Bolos inteiros</FilterButton>
        </div>
        <label htmlFor="busca-sabor" className={grid.srOnly}>Buscar sabor</label>
        <input
          id="busca-sabor"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar sabor…"
          style={{
            width: "100%", maxWidth: 320, padding: "11px 16px", fontSize: 16,
            border: "1px solid #eaddd0", borderRadius: 30, background: "#fff",
            fontFamily: "var(--font-body)", color: "#3f2a26", marginBottom: 8,
          }}
        />
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
            {SLICES.length === 0 && (
              <EmptyNotice>
                {term
                  ? `Nenhuma fatia encontrada para “${query.trim()}”.`
                  : "Nenhuma fatia disponível no momento. Volte logo mais!"}
              </EmptyNotice>
            )}
            {SLICES.map((s) => (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", background: s.cardBg, borderRadius: 14, padding: "76px 20px 22px", marginTop: 64 }}>
                  {s.soldOut && (
                    <div style={{ position: "absolute", top: 14, left: 14, lineHeight: 1, color: "#8b7d76", zIndex: 3, padding: "5px 7px", border: "1.5px solid #8b7d76", borderRadius: 6, background: "#fff" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em" }}>Esgotado</span>
                    </div>
                  )}
                  {s.lastUnits && (
                    <div style={{ position: "absolute", top: 14, left: 14, lineHeight: 1, color: "#c1531c", zIndex: 3, padding: "5px 7px", border: "1.5px solid #c1531c", borderRadius: 6, background: "#fff" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em" }}>
                        {s.left === 1 ? "Última!" : `Só ${s.left}`}
                      </span>
                    </div>
                  )}
                  <ProductImage src={s.img} alt={s.name} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, lineHeight: 1.2, color: "#3f2a26", textAlign: "center", marginTop: 14, letterSpacing: ".02em" }}>
                    {s.name}
                  </div>
                  <div style={{ width: 36, height: 2, background: s.lineColor, margin: "12px auto" }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#8a6470", margin: 0 }}>{s.tag}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#3f2a26", fontWeight: 600 }}>{s.price}</span>
                  <AddToCartButton onClick={() => addToCart(s.id, s.name, s.priceNum)} disabled={s.soldOut} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loadState === "ready" && filter === "bolos" && (
        <section style={{ padding: "24px 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
          <div className={grid.threeCol} style={{ gap: 32 }}>
            {CAKE_MODELS.length === 0 && (
              <EmptyNotice>
                {term
                  ? `Nenhum bolo encontrado para “${query.trim()}”.`
                  : "Nenhum modelo de bolo cadastrado no momento. Fale com a gente pelo WhatsApp!"}
              </EmptyNotice>
            )}
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
