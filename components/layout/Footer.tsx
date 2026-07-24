"use client";

import Link from "next/link";
import Image from "next/image";
import { useHoverStyle } from "@/lib/useHover";
import grid from "@/styles/grid.module.css";

const MAP_SRCDOC = `<!DOCTYPE html><html><head><meta charset='utf-8'/><link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/><script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script><style>html,body,#map{margin:0;padding:0;height:100%;width:100%}.leaflet-popup-content{margin:8px 10px;font-family:sans-serif;font-size:12px;color:#3f2a26}</style></head><body><div id='map'></div><script>window.onload=function(){const map=L.map('map',{zoomControl:true,attributionControl:false}).setView([-8.0742,-39.1225],14);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);setTimeout(()=>{map.invalidateSize()},200);const icon=L.divIcon({className:'',html:'<div style=\\'width:28px;height:28px;border-radius:50% 50% 50% 0;background:#c1531c;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center\\'><span style=\\'transform:rotate(45deg);color:#fff;font-family:serif;font-weight:700;font-size:12px\\'>M</span></div>',iconSize:[28,28],iconAnchor:[14,28]});const pts=[{name:'<b>Marta Confeitaria</b><br>Cozinha Principal · Salgueiro PE',lat:-8.0742,lng:-39.1225},{name:'<b>Padaria Bela Vista</b><br>Ponto de Revenda',lat:-8.0698,lng:-39.1187},{name:'<b>Empório Vila Doce</b><br>Ponto de Revenda',lat:-8.0781,lng:-39.1274}];pts.forEach((p,i)=>{const m=L.marker([p.lat,p.lng],{icon}).addTo(map).bindPopup(p.name);if(i===0)m.openPopup();});};</script></body></html>`;

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/bolos", label: "Bolos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/onde-encontrar", label: "Onde encontrar" },
  { href: "/revenda", label: "Seja revendedor" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const hover = useHoverStyle({ display: "block", padding: "4px 0", fontSize: 14 }, { color: "#fff" });
  return (
    <Link href={href} {...hover.handlers} style={hover.style}>
      {children}
    </Link>
  );
}

export function Footer() {
  const devHover = useHoverStyle({}, { color: "#fff" });
  const dashboardHover = useHoverStyle(
    { display: "inline-block", fontSize: 12, color: "rgba(255,255,255,.45)" },
    { color: "rgba(255,255,255,.9)" }
  );

  return (
    <footer style={{ background: "#a8431a", color: "rgba(255,255,255,.75)", padding: "56px 24px 30px" }}>
      <div className={grid.footerGrid} style={{ maxWidth: 1160, margin: "0 auto", gap: 32, alignItems: "start" }}>
        <div>
          <Link href="/" style={{ display: "inline-block", marginBottom: 14 }} aria-label="Marta Confeitaria">
            <Image src="/images/logo.png" alt="Marta Confeitaria" width={76} height={76} style={{ height: 76, width: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
          </Link>
          <p style={{ fontSize: 14, maxWidth: 280, lineHeight: 1.5, margin: "0 0 12px", color: "rgba(255,255,255,.85)" }}>
            Bolos caseiros feitos com carinho, fatia por fatia, desde a nossa cozinha para a sua mesa.
          </p>
          <Link href="/admin/dashboard" {...dashboardHover.handlers} style={dashboardHover.style}>
            Painel administrativo
          </Link>
        </div>

        <div>
          <h4 style={{ color: "#fff", fontFamily: "'Playfair Display',serif", marginBottom: 14, fontSize: 16 }}>Navegue</h4>
          {NAV_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h4 style={{ color: "#fff", fontFamily: "'Playfair Display',serif", margin: 0, fontSize: 16 }}>Onde nos encontrar</h4>
            <Link href="/onde-encontrar" style={{ fontSize: 13, color: "#fff", textDecoration: "underline" }}>
              Ver no mapa completo →
            </Link>
          </div>
          <iframe
            srcDoc={MAP_SRCDOC}
            width="100%"
            height={220}
            frameBorder="0"
            style={{ border: "none", borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 13, color: "rgba(255,255,255,.5)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>© 2026 Marta Confeitaria. Todos os direitos reservados.</span>
        <a href="https://portfolio-jr-lilac.vercel.app/" target="_blank" rel="noreferrer" {...devHover.handlers} style={devHover.style}>
          Desenvolvido por João Rodrigues
        </a>
      </div>
    </footer>
  );
}
