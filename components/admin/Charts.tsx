"use client";

import { useState } from "react";

// Chart tokens — light surface only (admin panel doesn't support dark mode),
// validated against #fcfcfb per the palette reference.
const INK = "#0b0b0b";
const INK_SECONDARY = "#52514e";
const INK_MUTED = "#898781";
const GRIDLINE = "#e1e0d9";
const BASELINE = "#c3c2b7";
const BRAND = "#c1531c";
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]; // validated order, slots 1-4

const fmtMoney = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");
const fmtCompact = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(Math.round(n)));

export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: INK_SECONDARY, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: INK, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: INK_MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const height = 220;
  const padL = 44;
  const padB = 24;
  const padT = 10;
  const plotW = width - padL - 8;
  const plotH = height - padB - padT;

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const niceMax = Math.ceil(max / 50) * 50 || 50;
  const barW = Math.min(18, (plotW / data.length) * 0.6);
  const step = plotW / data.length;

  const yTicks = [0, niceMax / 2, niceMax];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Receita por dia, últimos 30 dias">
        {yTicks.map((t, i) => {
          const y = padT + plotH - (t / niceMax) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={width - 8} y1={y} y2={y} stroke={GRIDLINE} strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
                {fmtCompact(t)}
              </text>
            </g>
          );
        })}
        <line x1={padL} x2={width - 8} y1={padT + plotH} y2={padT + plotH} stroke={BASELINE} strokeWidth={1} />

        {data.map((d, i) => {
          const h = (d.revenue / niceMax) * plotH;
          const x = padL + i * step + (step - barW) / 2;
          const y = padT + plotH - h;
          const isHover = hover === i;
          return (
            <rect
              key={d.date}
              x={x}
              y={h > 0 ? y : padT + plotH - 2}
              width={barW}
              height={Math.max(h, 2)}
              rx={4}
              fill={BRAND}
              opacity={hover === null || isHover ? 1 : 0.45}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {data.map((d, i) => {
          if (i % 5 !== 0 && i !== data.length - 1) return null;
          const x = padL + i * step + step / 2;
          const label = new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          return (
            <text key={d.date} x={x} y={height - 4} textAnchor="middle" fontSize={10} fill={INK_MUTED}>
              {label}
            </text>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          style={{
            position: "absolute",
            left: `${(padL + hover * step + step / 2) / width * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
            background: "#3f2a26",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
          }}
        >
          <strong>{fmtMoney(data[hover].revenue)}</strong> · {data[hover].orders} pedido{data[hover].orders === 1 ? "" : "s"}
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>
            {new Date(data[hover].date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = { PENDENTE: "Pendente", EM_PREPARO: "Em preparo", PRONTO: "Pronto", ENTREGUE: "Entregue" };

export function StatusBreakdown({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(STATUS_LABELS).map(([key, label], i) => ({
    key,
    label,
    value: counts[key] ?? 0,
    color: CATEGORICAL[i],
  }));
  const total = entries.reduce((s, e) => s + e.value, 0) || 1;

  return (
    <div>
      <div style={{ display: "flex", width: "100%", height: 20, borderRadius: 6, overflow: "hidden", gap: 2, background: "#f5ead9" }}>
        {entries.map((e) =>
          e.value > 0 ? (
            <div key={e.key} style={{ width: `${(e.value / total) * 100}%`, background: e.color, minWidth: 2 }} title={`${e.label}: ${e.value}`} />
          ) : null
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", marginTop: 14 }}>
        {entries.map((e) => (
          <div key={e.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
            <span style={{ color: INK_SECONDARY }}>{e.label}</span>
            <span style={{ color: INK, fontWeight: 600 }}>{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopProductsChart({ items }: { items: { name: string; qty: number; revenue: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.qty));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it) => (
        <div key={it.name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: INK, fontWeight: 600 }}>{it.name}</span>
            <span style={{ color: INK_SECONDARY }}>{it.qty} vendidas</span>
          </div>
          <div style={{ height: 10, background: "#f5ead9", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ width: `${(it.qty / max) * 100}%`, height: "100%", background: BRAND, borderRadius: 5 }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: INK_MUTED, fontSize: 14 }}>Sem vendas no período.</p>}
    </div>
  );
}
