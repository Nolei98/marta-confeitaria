"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 18, background: "#fbf7f0", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#c1531c", marginBottom: 6 };

function InfoCard({ bg, icon, title, text }: { bg: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, padding: 26, textAlign: "center", boxShadow: "0 8px 20px rgba(193,83,28,.05)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, margin: "0 auto 14px", display: "grid", placeItems: "center" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#c1531c", fontSize: 19, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: "#8b7d76", fontSize: 14, margin: 0 }}>{text}</p>
    </div>
  );
}

function SendButton() {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 16, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44 },
    { background: "#9c3f14" }
  );
  return (
    <button {...hover.handlers} style={hover.style}>
      Enviar mensagem
    </button>
  );
}

export default function ContatoPage() {
  return (
    <>
      <SiteHeader />

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 12 }}>Fale com a gente</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}>Contato</h1>
        <p style={{ color: "#8b7d76", maxWidth: 520, margin: "0 auto 40px" }}>Dúvidas, encomendas ou só pra combinar a entrega — estamos por aqui.</p>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        <InfoCard
          bg="#f6d9dd"
          title="WhatsApp"
          text="(87) 99876-5432"
          icon={<div style={{ width: 20, height: 15, background: "#fff", borderRadius: "10px 10px 10px 2px" }} />}
        />
        <InfoCard
          bg="#e6dcef"
          title="E-mail"
          text="contato@martaconfeitaria.com.br"
          icon={
            <div style={{ position: "relative", width: 20, height: 15 }}>
              <div style={{ width: 20, height: 15, border: "2px solid #fff", borderRadius: 3 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 47%, #fff 47%, #fff 53%, transparent 53%)" }} />
            </div>
          }
        />
        <InfoCard
          bg="#f3e2cf"
          title="Endereço"
          text="Rua das Framboesas, 122 — Centro, Salgueiro - PE"
          icon={
            <div style={{ width: 20, height: 20, border: "2px solid #fff", borderRadius: "50%", display: "grid", placeItems: "center" }}>
              <div style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%" }} />
            </div>
          }
        />
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 20, padding: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, margin: "0 0 20px" }}>Envie uma mensagem</h2>
          <label style={labelStyle}>Nome</label>
          <input type="text" placeholder="Seu nome" style={inputStyle} />
          <label style={labelStyle}>E-mail</label>
          <input type="email" placeholder="seu@email.com" style={inputStyle} />
          <label style={labelStyle}>Mensagem</label>
          <textarea placeholder="Como podemos ajudar?" rows={4} style={{ ...inputStyle, marginBottom: 20, resize: "vertical" }} />
          <SendButton />
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/scene-15.webp" alt="Fachada da Marta Confeitaria" style={{ width: "100%", height: 340, objectFit: "cover", borderRadius: 20, marginBottom: 16 }} />
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, padding: 20, fontSize: 14, color: "#8b7d76" }}>
            <strong style={{ color: "#c1531c", display: "block", marginBottom: 6 }}>Horário de funcionamento</strong>
            Terça a sábado, das 9h às 18h · Domingo, das 9h às 13h · Fechado às segundas
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
