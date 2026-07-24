"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

type Point = { id: number; name: string; address: string; lat: number; lng: number };

const DEFAULT_POINTS: Point[] = [
  { id: 1, name: "Marta Confeitaria — Cozinha principal", address: "Rua das Framboesas, 122 — Centro, Salgueiro - PE", lat: -8.0742, lng: -39.1225 },
  { id: 2, name: "Padaria Bela Vista", address: "Av. Antônio Gomes Sobrinho — Salgueiro - PE", lat: -8.0698, lng: -39.1187 },
  { id: 3, name: "Empório Vila Doce", address: "Rua Cel. José Ozanan — Salgueiro - PE", lat: -8.0781, lng: -39.1274 },
];

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

export default function OndeEncontrarPage() {
  const [points] = useState<Point[]>(DEFAULT_POINTS);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapElRef.current || mapRef.current) return;
      const map = L.map(mapElRef.current).setView([-8.0742, -39.1225], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:#a07882;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font-family:Playfair Display,serif;font-weight:700;font-size:14px">M</span></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      points.forEach((p) => {
        L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<strong>${p.name}</strong><br/>${p.address}`);
      });

      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusPoint = (p: Point) => {
    mapRef.current?.flyTo([p.lat, p.lng], 16);
  };

  return (
    <>
      <SiteHeader />

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#a07882", marginBottom: 12 }}>Nossos pontos de venda</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,38px)", margin: "0 0 12px" }}>Onde nos encontrar</h1>
        <p style={{ color: "#8b7d76", maxWidth: 520, margin: "0 auto 32px" }}>
          Além da nossa cozinha, você encontra as fatias da Marta em pontos parceiros pela cidade.
        </p>
      </section>

      <section className={grid.mapGrid} style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 60px", gap: 24, alignItems: "start" }}>
        <div ref={mapElRef} style={{ height: 460, borderRadius: 20, overflow: "hidden", border: "1px solid #eaddd0", background: "#eee" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 460, overflowY: "auto" }}>
          {points.map((p) => (
            <PointCard key={p.id} point={p} onFocus={() => focusPoint(p)} />
          ))}
        </div>
      </section>

      <section style={{ padding: "0 24px 80px", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ background: "#c1531c", borderRadius: 26, padding: "44px 40px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 10 }}>
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
