"use client";

import { useEffect, useState } from "react";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

const MODELS_FALLBACK = [
  { name: "Bolo de aniversário", desc: "Chantilly, frutas vermelhas e velinhas — o clássico de toda festa.", img: "/images/cake-10.jpg" },
  { name: "Bolo de festa", desc: "Andares em tons pastel com rosas de açúcar, pra ocasiões especiais.", img: "/images/cake-11.webp" },
  { name: "Bolo temático", desc: "Chocolate coberto de rosas, personalizável para o tema da sua festa.", img: "/images/cake-12.jpg" },
];

const SIZES = [
  { key: "P", label: "P", fatias: "10 fatias", price: "R$ 75,00" },
  { key: "M", label: "M", fatias: "20 fatias", price: "R$ 130,00" },
  { key: "G", label: "G", fatias: "30 fatias", price: "R$ 180,00" },
] as const;

const FLAVOR_OPTIONS_FALLBACK = ["Chocolate intenso", "Red velvet", "Cenoura com chocolate", "Prestígio", "Ninho com Nutella", "Limão siciliano", "Floresta negra", "Maracujá", "Fubá cremoso"];

type DbProduct = { id: string; name: string; category: string; price: number; imageUrl: string | null };

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 20, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#c1531c", marginBottom: 6 };

function newCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

function SubmitButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 16, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, marginTop: 14 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Enviar pedido pelo WhatsApp
    </button>
  );
}

export function EncomendaForm() {
  const [products, setProducts] = useState<DbProduct[] | null>(null);
  const [flavor, setFlavor] = useState(FLAVOR_OPTIONS_FALLBACK[0]);
  const [size, setSize] = useState<(typeof SIZES)[number]["key"]>("M");
  const [pickupDate, setPickupDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    setCaptcha(newCaptcha());
    fetch("/api/public/products")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProducts(data))
      .catch(() => {});
  }, []);

  const dbFatias = products?.filter((p) => p.category === "Fatia") ?? [];
  const FLAVOR_OPTIONS = dbFatias.length > 0 ? dbFatias.map((p) => p.name) : FLAVOR_OPTIONS_FALLBACK;
  useEffect(() => {
    if (!FLAVOR_OPTIONS.includes(flavor)) setFlavor(FLAVOR_OPTIONS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FLAVOR_OPTIONS.join("|")]);

  const dbBolos = products?.filter((p) => p.category === "Bolo inteiro") ?? [];
  const MODELS = dbBolos.length > 0 ? dbBolos.map((p) => ({ name: p.name, desc: "Sob encomenda, personalizável para o tema da sua festa.", img: p.imageUrl || "/images/cake-10.jpg" })) : MODELS_FALLBACK;

  const submit = () => {
    if (!captcha || parseInt(captchaInput, 10) !== captcha.a + captcha.b) {
      setCaptchaError(true);
      setCaptcha(newCaptcha());
      setCaptchaInput("");
      return;
    }
    setCaptchaError(false);
    setCaptcha(newCaptcha());
    setCaptchaInput("");
    const sizeInfo = SIZES.find((sz) => sz.key === size)!;
    const lines = [
      "Olá! Gostaria de encomendar um bolo inteiro:",
      "Sabor: " + flavor,
      "Tamanho: " + sizeInfo.label + " (" + sizeInfo.fatias + ") — " + sizeInfo.price,
      pickupDate ? "Retirada: " + pickupDate : "",
      "Nome: " + (name || "-"),
      notes ? "Observações: " + notes : "",
    ].filter(Boolean);
    window.open("https://wa.me/5511967891234?text=" + encodeURIComponent(lines.join("\n")), "_blank");
  };

  return (
    <>
      <section style={{ padding: "0 0 40px" }}>
        <div className={grid.threeCol} style={{ gap: 32 }}>
          {MODELS.map((m) => (
            <div key={m.name} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.img} alt={m.name} style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ padding: 22 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, margin: "0 0 8px", color: "#3f2a26", lineHeight: 1.2, letterSpacing: ".02em" }}>{m.name}</h3>
                <p style={{ fontSize: 14, color: "#8b7d76", margin: 0, fontFamily: "var(--font-body)" }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "0 0 40px", maxWidth: 760, margin: "0 auto" }}>
        <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 6px", textAlign: "center" }}>Monte seu pedido</h2>
          <p style={{ color: "#8b7d76", textAlign: "center", margin: "0 0 28px", fontSize: 14 }}>Preencha os dados e envie direto pelo WhatsApp</p>

          <label style={labelStyle}>Sabor</label>
          <select value={flavor} onChange={(e) => setFlavor(e.target.value)} style={inputStyle}>
            {FLAVOR_OPTIONS.map((fo) => (
              <option key={fo} value={fo}>
                {fo}
              </option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginBottom: 10 }}>Tamanho</label>
          <div className={grid.sizeGrid} style={{ gap: 12, marginBottom: 20 }}>
            {SIZES.map((sz) => (
              <div
                key={sz.key}
                onClick={() => setSize(sz.key)}
                style={{
                  position: "relative",
                  border: `1px solid ${size === sz.key ? "#a07882" : "#eaddd0"}`,
                  borderRadius: 14,
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  background: size === sz.key ? "#fff" : "#f5ead9",
                  transition: "all .15s ease",
                }}
              >
                <strong style={{ display: "block", fontFamily: "'Playfair Display',serif", color: "#c1531c", fontSize: 18 }}>{sz.label}</strong>
                <small style={{ color: "#8b7d76", fontSize: 13, display: "block" }}>{sz.fatias}</small>
                <small style={{ color: "#8a6470", fontSize: 13, fontWeight: 600 }}>{sz.price}</small>
              </div>
            ))}
          </div>

          <label style={labelStyle}>Data de retirada</label>
          <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Seu nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" style={inputStyle} />

          <label style={labelStyle}>WhatsApp</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" style={inputStyle} />

          <label style={labelStyle}>Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mensagem no topo, cor da faixa, alergias..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label style={labelStyle}>
            Confirmação: quanto é {captcha ? `${captcha.a} + ${captcha.b}` : "..."}?
          </label>
          <input
            type="number"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            placeholder="Sua resposta"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          {captchaError && <p style={{ color: "#b3554d", fontSize: 13, margin: "0 0 18px" }}>Resposta incorreta, tente novamente.</p>}

          <SubmitButton onClick={submit} />
        </div>
      </section>
    </>
  );
}
