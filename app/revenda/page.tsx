"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 18, background: "#fbf7f0", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#c1531c", marginBottom: 6 };

const PERKS = [
  { bg: "#f6d9dd", title: "Entrega programada", desc: "Fatias fresquinhas entregues nos dias combinados, sem complicação.", icon: <div style={{ width: 18, height: 18, border: "2px solid #fff", borderRadius: 4 }} /> },
  { bg: "#e6dcef", title: "Margem atrativa", desc: "Preço especial para revenda, com boa margem pro seu negócio.", icon: <div style={{ width: 20, height: 20, border: "2px solid #fff", borderRadius: "50%" }} /> },
  { bg: "#f3e2cf", title: "Suporte próximo", desc: "Time direto no WhatsApp pra combinar tudo, do pedido à reposição.", icon: <div style={{ width: 20, height: 14, borderRadius: "10px 10px 10px 2px", background: "#fff" }} /> },
];

function SubmitButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 16, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Enviar cadastro pelo WhatsApp
    </button>
  );
}

export default function RevendaPage() {
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    const lines = [
      "Olá! Tenho interesse em revender os produtos da Marta Confeitaria:",
      "Estabelecimento: " + (business || "-"),
      "Responsável: " + (name || "-"),
      "Telefone: " + (phone || "-"),
      "Endereço: " + (address || "-"),
      notes ? "Observações: " + notes : "",
    ].filter(Boolean);
    window.open("https://wa.me/5511967891234?text=" + encodeURIComponent(lines.join("\n")), "_blank");
  };

  return (
    <>
      <SiteHeader />

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 12 }}>Parceria</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,38px)", margin: "0 0 12px" }}>Seja revendedor</h1>
        <p style={{ color: "#8b7d76", maxWidth: 560, margin: "0 auto 32px" }}>
          Tem uma padaria, cafeteria ou loja de conveniência? Revenda as fatias da Marta e aumente seu cardápio de doces sem colocar a mão na massa.
        </p>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        {PERKS.map((p) => (
          <div key={p.title} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 28, textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: p.bg, margin: "0 auto 16px", display: "grid", placeItems: "center" }}>{p.icon}</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 8px", color: "#c1531c" }}>{p.title}</h3>
            <p style={{ fontSize: 14, color: "#8b7d76", margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: "0 24px 80px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 40 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, margin: "0 0 6px", textAlign: "center" }}>Cadastre seu estabelecimento</h2>
          <p style={{ color: "#8b7d76", textAlign: "center", margin: "0 0 26px", fontSize: 14 }}>Enviamos direto pelo WhatsApp e retornamos em até 1 dia útil</p>

          <label style={labelStyle}>Nome do estabelecimento</label>
          <input type="text" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Ex: Padaria Bela Vista" style={inputStyle} />

          <label style={labelStyle}>Seu nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" style={inputStyle} />

          <label style={labelStyle}>WhatsApp</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" style={inputStyle} />

          <label style={labelStyle}>Endereço</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" style={inputStyle} />

          <label style={labelStyle}>Mensagem (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Conte um pouco sobre seu espaço"
            rows={3}
            style={{ ...inputStyle, marginBottom: 26, resize: "vertical" }}
          />

          <SubmitButton onClick={submit} />
        </div>
      </section>

      <Footer />
    </>
  );
}
