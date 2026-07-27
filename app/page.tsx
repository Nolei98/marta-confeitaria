"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/Loading";
import { useCart } from "@/components/cart/CartContext";
import { useHoverStyle } from "@/lib/useHover";
import { WHATSAPP_URL } from "@/lib/contact";
import grid from "@/styles/grid.module.css";
import hero from "./HomeHero.module.css";
import { HeartIcon, ClockIcon, TagIcon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductImage } from "@/components/product/ProductImage";

type Flavor = { key: string; name: string; desc: string; price: string; img: string; bg: string; bgImg: string };

const FLAVORS: Flavor[] = [
  { key: "choc", name: "Chocolate intenso", desc: "Camadas de bolo de chocolate úmido com recheio cremoso de brigadeiro de colher.", price: "R$ 12,00", img: "/images/slice-chocolate.webp", bg: "#3a211c", bgImg: "/images/hero-bg-chocolate.jpg" },
  { key: "red", name: "Red velvet", desc: "Massa aveludada vermelha com recheio de cream cheese e um toque de baunilha.", price: "R$ 14,00", img: "/images/slice-red-velvet.webp", bg: "#4a1620", bgImg: "/images/hero-bg-redvelvet.jpg" },
  { key: "carrot", name: "Cenoura com chocolate", desc: "Bolo de cenoura fofinho coberto com brigadeiro de chocolate na medida certa.", price: "R$ 10,00", img: "/images/slice-cenoura.webp", bg: "#5a3410", bgImg: "/images/hero-bg-cenoura.jpg" },
];

const SHAPE_SETS: Record<string, { top: string; left: string; size: number; color: string; anim: string; dur: string; delay: string }[]> = {
  choc: [
    { top: "14%", left: "8%", size: 44, color: "rgba(120,80,50,.5)", anim: "floatA", dur: "7s", delay: "0s" },
    { top: "62%", left: "4%", size: 22, color: "rgba(200,160,110,.35)", anim: "floatB", dur: "6s", delay: ".4s" },
    { top: "30%", left: "88%", size: 30, color: "rgba(160,110,70,.4)", anim: "floatC", dur: "8s", delay: ".2s" },
    { top: "78%", left: "82%", size: 50, color: "rgba(90,60,40,.45)", anim: "floatA", dur: "9s", delay: ".6s" },
    { top: "50%", left: "50%", size: 18, color: "rgba(210,170,120,.3)", anim: "floatB", dur: "5s", delay: ".1s" },
  ],
  red: [
    { top: "18%", left: "10%", size: 34, color: "rgba(220,60,90,.45)", anim: "floatA", dur: "6.5s", delay: "0s" },
    { top: "60%", left: "6%", size: 26, color: "rgba(250,220,225,.35)", anim: "floatC", dur: "7s", delay: ".3s" },
    { top: "26%", left: "86%", size: 40, color: "rgba(180,40,70,.4)", anim: "floatB", dur: "8s", delay: ".5s" },
    { top: "74%", left: "80%", size: 28, color: "rgba(240,200,205,.3)", anim: "floatA", dur: "6s", delay: ".2s" },
    { top: "46%", left: "46%", size: 20, color: "rgba(220,60,90,.3)", anim: "floatC", dur: "9s", delay: ".4s" },
  ],
  carrot: [
    { top: "16%", left: "9%", size: 38, color: "rgba(230,140,50,.45)", anim: "floatB", dur: "7s", delay: "0s" },
    { top: "64%", left: "5%", size: 24, color: "rgba(110,160,90,.4)", anim: "floatA", dur: "6s", delay: ".3s" },
    { top: "28%", left: "88%", size: 32, color: "rgba(200,110,40,.4)", anim: "floatC", dur: "8s", delay: ".2s" },
    { top: "76%", left: "84%", size: 46, color: "rgba(150,90,40,.4)", anim: "floatB", dur: "9s", delay: ".5s" },
    { top: "50%", left: "48%", size: 20, color: "rgba(120,170,100,.35)", anim: "floatA", dur: "5.5s", delay: ".15s" },
  ],
};

function wrapStyle(offset: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "clamp(150px, 44vw, 250px)",
    height: "clamp(198px, 58vw, 330px)",
    transition: "transform .8s cubic-bezier(.22,1,.36,1), opacity .6s ease",
    cursor: "pointer",
  };
  if (offset === 0) return { ...base, transform: "translate(-50%,-50%) scale(1.18) rotateY(0deg)", opacity: 1, zIndex: 3 };
  if (offset === -1) return { ...base, transform: "translate(-50%,-50%) translateX(clamp(-165px,-24vw,-78px)) translateY(18px) scale(.66) rotateY(30deg)", opacity: 0.5, zIndex: 1 };
  return { ...base, transform: "translate(-50%,-50%) translateX(clamp(78px,24vw,165px)) translateY(18px) scale(.66) rotateY(-30deg)", opacity: 0.5, zIndex: 1 };
}
function imgStyle(offset: number): React.CSSProperties {
  const base: React.CSSProperties = { width: "100%", height: "100%", objectFit: "contain", transition: "filter .6s ease" };
  if (offset === 0) return { ...base, filter: "drop-shadow(0 30px 26px rgba(0,0,0,.35))" };
  return { ...base, filter: "drop-shadow(0 14px 14px rgba(0,0,0,.25))", animation: "breathe 2.6s ease-in-out infinite" };
}

function PrevNextButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  const hover = useHoverStyle(
    { width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 16, cursor: "pointer" },
    { background: "rgba(255,255,255,.22)" }
  );
  return (
    <button onClick={onClick} aria-label={label} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

function CardapioCta() {
  const hover = useHoverStyle(
    { background: "#fff", color: "#c1531c", borderRadius: 40, padding: "14px 28px", fontWeight: 600, fontSize: 15, display: "inline-block" },
    { transform: "scale(1.08)" }
  );
  return (
    <Link href="/cardapio" {...hover.handlers} style={hover.style}>
      Comprar agora
    </Link>
  );
}

function WhatsAppHeroButton() {
  const hover = useHoverStyle(
    { width: 40, height: 40, borderRadius: "50%", background: "transparent", border: "1.5px solid #fff", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 },
    { background: "rgba(255,255,255,.15)", transform: "scale(1.08)" }
  );
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      title="Falar no WhatsApp"
      aria-label="Falar no WhatsApp"
      {...hover.handlers}
      style={hover.style}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.07c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.69-.8.88-1.08.19-.28.37-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
      </svg>
    </a>
  );
}

function BolosCta() {
  const hover = useHoverStyle(
    { background: "#fff", color: "#c1531c", borderRadius: 40, padding: "14px 28px", fontWeight: 600, fontSize: 15, display: "inline-block" },
    { transform: "scale(1.05)" }
  );
  return (
    <Link href="/bolos" {...hover.handlers} style={hover.style}>
      Encomendar bolo
    </Link>
  );
}

type SectionKey = "hero" | "fatias" | "vendidos" | "bolosCta";
type DbProduct = { id: string; name: string; category: string; price: number; imageUrl: string | null; stock: number | null };

const DAILY_STYLES = [
  { tag: "Mais pedida", cardBg: "#f6d9dd", lineColor: "#d9a3ac" },
  { tag: "Clássica", cardBg: "#e6dcef", lineColor: "#b9a3d1" },
  { tag: "Queridinha", cardBg: "#f3e2cf", lineColor: "#d9b57e" },
];
const BESTSELLER_FALLBACK_IMG = "/images/slice-chocolate.webp";

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [flavors, setFlavors] = useState<Flavor[]>(FLAVORS);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({ hero: true, fatias: true, vendidos: true, bolosCta: true });
  const [fatiaProducts, setFatiaProducts] = useState<DbProduct[] | null>(null);
  const [landingLoaded, setLandingLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addToCart } = useCart();
  const ready = landingLoaded && productsLoaded;

  const startAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % flavors.length);
    }, 5200);
  };

  useEffect(() => {
    fetch("/api/public/landing")
      .then((r) => r.json())
      .then((data) => {
        if (data?.heroFlavors?.length) {
          setFlavors(
            FLAVORS.map((fl) => {
              const match = data.heroFlavors.find((h: { key: string }) => h.key === fl.key);
              return match ? { ...fl, name: match.name, desc: match.desc, price: match.price, img: match.img, bg: match.bg } : fl;
            })
          );
        }
        if (data?.sections) setSections((s) => ({ ...s, ...data.sections }));
      })
      .catch(() => {})
      .finally(() => setLandingLoaded(true));
    fetch("/api/public/products")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setFatiaProducts(data.filter((p: DbProduct) => p.category === "Fatia")))
      .catch(() => {})
      .finally(() => setProductsLoaded(true));
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent((c) => (i + flavors.length) % flavors.length);
    startAutoplay();
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);
  const pauseAutoplay = () => timerRef.current && clearInterval(timerRef.current);
  const resumeAutoplay = () => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) startAutoplay();
  };

  const active = flavors[current];

  const slides = flavors.map((f, i) => {
    let offset = (i - current + flavors.length) % flavors.length;
    if (offset === 2) offset = -1;
    return { img: f.img, name: f.name, wrapStyle: wrapStyle(offset), imgStyle: imgStyle(offset), i };
  });

  const decorLayers = Object.keys(SHAPE_SETS).map((key) => ({
    key,
    opacity: key === active.key ? 1 : 0,
    shapes: SHAPE_SETS[key],
  }));

  // Sem catálogo de emergência: se o banco não devolveu produto, a seção
  // simplesmente não aparece. Mostrar sabor inventado leva o cliente a pedir
  // algo que a cozinha não tem — mesma decisão já tomada em /cardapio.
  const slices = fatiaProducts ?? [];

  const dailySlices = slices.slice(0, 3).map((p, i) => ({
    name: p.name,
    tag: DAILY_STYLES[i % DAILY_STYLES.length].tag,
    price: formatBRL(p.price),
    img: p.imageUrl || BESTSELLER_FALLBACK_IMG,
    cardBg: DAILY_STYLES[i % DAILY_STYLES.length].cardBg,
    lineColor: DAILY_STYLES[i % DAILY_STYLES.length].lineColor,
    add: () => addToCart(p.name, p.price),
    soldOut: p.stock === 0,
  }));

  const bestsellers = slices.slice(0, 5).map((p, i) => ({
    name: p.name,
    price: formatBRL(p.price),
    priceNum: p.price,
    img: p.imageUrl || BESTSELLER_FALLBACK_IMG,
    rank: `${i + 1}º`,
    soldOut: p.stock === 0,
  }));

  if (!ready) {
    return (
      <>
        <SiteHeader floating />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <SiteHeader floating />

      {sections.hero && (
      <section
        className={hero.heroSection}
        style={{ position: "relative", overflow: "hidden", color: "#fff", backgroundColor: active.bg, transition: "background-color .9s ease", display: "flex", alignItems: "center" }}
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
      >
        {decorLayers.map((layer) => (
          <div key={layer.key} style={{ position: "absolute", inset: 0, opacity: layer.opacity, transition: "opacity .9s ease", pointerEvents: "none" }}>
            {layer.shapes.map((s, i) => (
              <div
                key={i}
                style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: s.color, animation: `${s.anim} ${s.dur} ease-in-out infinite`, animationDelay: s.delay }}
              />
            ))}
          </div>
        ))}

        <div className={`${hero.heroWrap} ${grid.heroGrid}`} style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto", gap: 40, alignItems: "center", width: "100%" }}>
          <div className={hero.heroTextCol} style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.8)" }}>
                Feito à mão, fatia por fatia
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.85)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#f5a623", letterSpacing: 1 }}>★★★★★</span> 4.9 · +500 clientes
              </span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(34px,4.6vw,54px)", fontWeight: 700, lineHeight: 1.08, margin: "0 0 18px", minHeight: "1.3em" }}>
              {active.name}
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.86)", maxWidth: 440, margin: "0 0 26px", minHeight: 54 }}>{active.desc}</p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700 }}>
                {active.price} <span style={{ fontFamily: "Inter,sans-serif", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.7)" }}>/ fatia</span>
              </div>
              <CardapioCta />
              <WhatsAppHeroButton />
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,.55)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: "rotate(-8deg)", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: "rgba(255,255,255,.85)", lineHeight: 1.15 }}>
                  100%
                  <br />
                  caseiro
                </span>
              </div>
            </div>
            <div className={hero.prevNextDesktop} style={{ alignItems: "center", gap: 10, position: "relative", zIndex: 5 }}>
              <PrevNextButton onClick={prev} label="Sabor anterior">‹</PrevNextButton>
              <PrevNextButton onClick={next} label="Próximo sabor">›</PrevNextButton>
            </div>
          </div>

          <div className={hero.heroImageCol}>
            <div className={hero.coverflow} style={{ position: "relative", perspective: 1300 }}>
              {slides.map((s) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div key={s.i} onClick={() => goTo(s.i)} style={s.wrapStyle}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.name} style={s.imgStyle} />
                </div>
              ))}
            </div>
            <div className={hero.prevNextMobile} style={{ alignItems: "center", gap: 10, position: "relative", zIndex: 5 }}>
              <PrevNextButton onClick={prev} label="Sabor anterior">‹</PrevNextButton>
              <PrevNextButton onClick={next} label="Próximo sabor">›</PrevNextButton>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 2, width: "100%", height: 23, background: "radial-gradient(circle at 10px -6px, transparent 11.6px, #c1531c 12.4px) 0 0/24px 22px repeat-x", zIndex: 1 }} />
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 22, background: "radial-gradient(circle at 10px -6px, transparent 11.6px, #f5ead9 12.4px) 0 0/24px 22px repeat-x", zIndex: 2 }} />
      </section>
      )}

      {/* FATIAS DO DIA */}
      {sections.fatias && dailySlices.length > 0 && (
      <section style={{ padding: "88px 24px 72px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
            Feito à mão · Fresquinho · Afeto
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 40, letterSpacing: ".06em", textTransform: "uppercase", color: "#3f2a26", margin: 0 }}>
            Fatias do dia
          </h2>
        </div>
        <div className={grid.threeCol} style={{ gap: "40px 32px" }}>
          {dailySlices.map((d) => (
            <div key={d.name} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", background: d.cardBg, borderRadius: 14, padding: "76px 20px 22px", marginTop: 64 }}>
                <ProductImage src={d.img} alt={d.name} />
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, lineHeight: 1.2, color: "#3f2a26", textAlign: "center", marginTop: 14, letterSpacing: ".02em" }}>
                  {d.name}
                </div>
                <div style={{ width: 36, height: 2, background: d.lineColor, margin: "12px auto" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#8a6470", margin: 0 }}>{d.tag}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#3f2a26", fontWeight: 600 }}>{d.price}</span>
                <AddToCartButton onClick={d.add} disabled={d.soldOut} />
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* MAIS VENDIDOS */}
      {sections.vendidos && bestsellers.length > 0 && (
      <section style={{ padding: "72px 24px", background: "#f7f1e8" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
              Provado · Aprovado · Repetido
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 38, letterSpacing: ".06em", textTransform: "uppercase", color: "#3f2a26", margin: 0 }}>
              Mais vendidos da semana
            </h2>
          </div>
          <div className={grid.fiveCol} style={{ gap: "24px 16px" }}>
            {bestsellers.map((sl) => (
              <div key={sl.name} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", background: "#fff", border: "1px solid #eaddd0", borderRadius: 14, padding: "52px 12px 16px", marginTop: 44 }}>
                  <div className={hero.bestsellerBadge} style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 3, color: "#c1531c", fontFamily: "var(--font-display)", zIndex: 1, background: "rgba(251,247,240,.9)", padding: "3px 7px", borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,.08)" }}>
                    <span style={{ fontSize: 11 }}>★</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{sl.rank}</span>
                  </div>
                  <AddToCartButton variant="corner" className={hero.bestsellerAdd} onClick={() => addToCart(sl.name, sl.priceNum)} disabled={sl.soldOut} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sl.img} alt={sl.name} style={{ position: "absolute", top: -44, left: "50%", transform: "translateX(-50%)", height: 100, objectFit: "contain", filter: "drop-shadow(0 14px 10px rgba(58,33,28,.22))" }} loading="lazy" decoding="async" />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "#3f2a26", lineHeight: 1.2, marginTop: 10, letterSpacing: ".01em" }}>
                    {sl.name}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#8a6470", fontWeight: 600, marginTop: 10 }}>{sl.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* POR QUE ESCOLHER */}
      <section style={{ padding: "72px 24px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".24em", textTransform: "uppercase", color: "#c1531c", marginBottom: 10 }}>
            Simples · Honesto · Nosso
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 38, letterSpacing: ".06em", textTransform: "uppercase", color: "#3f2a26", margin: 0 }}>
            Por que escolher a Marta
          </h2>
        </div>
        <div className={grid.threeCol} style={{ gap: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: "30px 26px", textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#f6d9dd", margin: "0 auto 16px", display: "grid", placeItems: "center", color: "#c1531c" }}>
              <HeartIcon />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 8px", color: "#c1531c" }}>Receita caseira</h3>
            <p style={{ fontSize: 14, color: "#8b7d76", margin: 0 }}>Feita com ingredientes simples, do jeito que a vó fazia.</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: "30px 26px", textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#e6dcef", margin: "0 auto 16px", display: "grid", placeItems: "center", color: "#7d52a8" }}>
              <ClockIcon />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 8px", color: "#c1531c" }}>Sempre fresquinho</h3>
            <p style={{ fontSize: 14, color: "#8b7d76", margin: 0 }}>Assamos todos os dias — nada fica na prateleira.</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: "30px 26px", textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#f3e2cf", margin: "0 auto 16px", display: "grid", placeItems: "center", color: "#d49a37" }}>
              <TagIcon />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 8px", color: "#c1531c" }}>Preço justo</h3>
            <p style={{ fontSize: 14, color: "#8b7d76", margin: 0 }}>Qualidade de confeitaria fina, sem pesar no bolso.</p>
          </div>
        </div>
      </section>

      {/* BOLOS CTA */}
      {sections.bolosCta && (
      <section style={{ padding: "0 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
        <div className={grid.twoCol} style={{ background: "#3b2420", borderRadius: 24, padding: 24, alignItems: "center", gap: 32 }}>
          <div style={{ padding: "24px 12px 24px 24px", color: "#fff" }}>
            <div className={grid.eyebrow} style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 16 }}>
              Sob encomenda
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, letterSpacing: ".04em", textTransform: "uppercase", margin: "0 0 16px", lineHeight: 1.2 }}>
              Bolos inteiros para celebrar
            </h2>
            <p style={{ color: "rgba(255,255,255,.82)", maxWidth: 380, margin: "0 0 28px", fontSize: 15, lineHeight: 1.5 }}>
              Modelos de aniversário, festa e temáticos — do tamanho P ao G, prontos pra sua data.
            </p>
            <BolosCta />
          </div>
          <div style={{ height: "100%", minHeight: 330, borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cake_clean.png" alt="Bolo temático sob encomenda" style={{ width: "100%", height: "100%", minHeight: 330, objectFit: "cover", display: "block", borderRadius: 18 }} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
      )}

      <Footer />
    </>
  );
}
