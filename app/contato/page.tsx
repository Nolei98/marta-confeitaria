"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";
import { WhatsAppIcon, MailIcon, MapPinIcon } from "@/components/icons";

type Point = { id: string; name: string; address: string; lat: number; lng: number };

const DEFAULT_POINTS: Point[] = [
  { id: "default-1", name: "Marta Confeitaria — Cozinha principal", address: "Rua das Framboesas, 122 — Centro, Salgueiro - PE", lat: -8.0742, lng: -39.1225 },
  { id: "default-2", name: "Padaria Bela Vista", address: "Av. Antônio Gomes Sobrinho — Salgueiro - PE", lat: -8.0698, lng: -39.1187 },
  { id: "default-3", name: "Empório Vila Doce", address: "Rua Cel. José Ozanan — Salgueiro - PE", lat: -8.0781, lng: -39.1274 },
];

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 18, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#c1531c", marginBottom: 6 };

function InfoCard({ bg, color, icon, title, text }: { bg: string; color: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, padding: 26, textAlign: "center", boxShadow: "0 8px 20px rgba(193,83,28,.05)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, margin: "0 auto 14px", display: "grid", placeItems: "center", color }}>{icon}</div>
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

function PointCard({ point, onFocus }: { point: Point; onFocus: () => void }) {
  const hover = useHoverStyle(
    { background: "#fff", border: "1px solid #eaddd0", borderRadius: 14, padding: 16, cursor: "pointer" },
    { borderColor: "#a07882" }
  );
  return (
    <div onClick={onFocus} {...hover.handlers} style={hover.style}>
      <div style={{ fontWeight: 700, color: "#c1531c", fontSize: 15, marginBottom: 4 }}>{point.name}</div>
      <div style={{ color: "#8b7d76", fontSize: 13 }}>{point.address}</div>
    </div>
  );
}

function RevendaCta() {
  const hover = useHoverStyle(
    { background: "#fff", color: "#c1531c", borderRadius: 40, padding: "14px 28px", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" },
    {}
  );
  return (
    <Link href="/revenda" {...hover.handlers} style={hover.style}>
      Seja revendedor
    </Link>
  );
}

export default function ContatoPage() {
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetch("/api/public/sales-points")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && data.length && setPoints(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapElRef.current || mapRef.current) return;
      mapRef.current = L.map(mapElRef.current).setView([-8.0742, -39.1225], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);
      setMapReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const icon = L.divIcon({
        className: "",
        html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:#a07882;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font-family:Playfair Display,serif;font-weight:700;font-size:14px">M</span></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      points.forEach((p) => {
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<strong>${p.name}</strong><br/>${p.address}`);
        markersRef.current.push(marker);
      });

      // The map's height now stretches to match the points column, which can
      // change once real sales points load — Leaflet needs an explicit nudge
      // to re-measure its container, or tiles render stale/cut off.
      requestAnimationFrame(() => map.invalidateSize());
    });
    return () => {
      cancelled = true;
    };
  }, [points, mapReady]);

  const focusPoint = (p: Point) => {
    mapRef.current?.flyTo([p.lat, p.lng], 16);
  };

  return (
    <>
      <SiteHeader />

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 24px 20px", textAlign: "center" }}>
        <div className={grid.eyebrow} style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 12 }}>Fale com a gente</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}>Contato e onde encontrar</h1>
        <p style={{ color: "#8b7d76", maxWidth: 520, margin: "0 auto 40px" }}>Dúvidas, encomendas ou só pra combinar a entrega — estamos por aqui. Você também encontra as fatias da Marta em pontos parceiros pela cidade.</p>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,28px)", margin: "0 0 8px" }}>Onde nos encontrar</h2>
      </section>

      <section className={grid.mapGrid} style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", gap: 24 }}>
        <div ref={mapElRef} style={{ minHeight: 260, borderRadius: 20, overflow: "hidden", border: "1px solid #eaddd0", background: "#eee", position: "relative", zIndex: 0, isolation: "isolate" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {points.map((p) => (
            <PointCard key={p.id} point={p} onFocus={() => focusPoint(p)} />
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        <hr style={{ margin: "0 0 60px", border: "none", borderTop: "1px solid #eaddd0" }} />
      </div>

      <section className={grid.twoCol} style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", gap: 32, alignItems: "start" }}>
        <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 20 }}>
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

      <section className={grid.threeCol} style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", gap: 24 }}>
        <InfoCard bg="#f6d9dd" color="#c1531c" title="WhatsApp" text="(87) 99876-5432" icon={<WhatsAppIcon size={22} />} />
        <InfoCard bg="#e6dcef" color="#7d52a8" title="E-mail" text="contato@martaconfeitaria.com.br" icon={<MailIcon size={22} />} />
        <InfoCard bg="#f3e2cf" color="#d49a37" title="Endereço" text="Rua das Framboesas, 122 — Centro, Salgueiro - PE" icon={<MapPinIcon size={22} />} />
      </section>

      <section style={{ padding: "0 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ background: "#c1531c", borderRadius: 26, padding: "44px 40px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div className={grid.eyebrow} style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 10 }}>
              Tem uma loja ou padaria?
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, margin: "0 0 8px" }}>Seja um ponto de venda parceiro</h2>
            <p style={{ color: "rgba(255,255,255,.8)", margin: 0, maxWidth: 420 }}>
              Quer revender as fatias da Marta no seu estabelecimento? Fale com a gente.
            </p>
          </div>
          <RevendaCta />
        </div>
      </section>

      <Footer />
    </>
  );
}
