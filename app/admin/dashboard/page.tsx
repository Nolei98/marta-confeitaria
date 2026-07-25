"use client";

import { useEffect, useState } from "react";
import { SimpleHeader } from "@/components/layout/SimpleHeader";
import grid from "@/styles/grid.module.css";
import styles from "./Dashboard.module.css";
import { StatTile, RevenueChart, StatusBreakdown, TopProductsChart } from "@/components/admin/Charts";

const cssVars = (vars: Record<string, string>) => vars as React.CSSProperties;

type Product = { id: string; name: string; category: string; price: number; imageUrl?: string | null; active: boolean };
type OrderItem = { id: string; nameSnapshot: string; priceSnapshot: number; qty: number };
type Order = { id: string; code: string; status: string; total: number; createdAt: string; items: OrderItem[]; user: { name: string; email: string } };
type Ponto = { id: string; name: string; address: string; lat: number; lng: number };
type HeroFlavor = { key: string; name: string; desc: string; price: string; img: string; bg: string };

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
};

const EMPTY_FORM = { id: null as string | null, name: "", price: "", category: "Fatia", image: "" };
const EMPTY_PONTO_FORM = { id: null as string | null, name: "", address: "", lat: "", lng: "" };

const IMAGE_OPTIONS = [
  { value: "/images/slice-chocolate.webp", label: "Chocolate intenso" },
  { value: "/images/slice-red-velvet.webp", label: "Red velvet" },
  { value: "/images/slice-cenoura.webp", label: "Cenoura com chocolate" },
  { value: "/images/slice-prestigio.webp", label: "Prestígio" },
  { value: "/images/slice-ninho.webp", label: "Ninho com Nutella" },
  { value: "/images/slice-limao.webp", label: "Limão siciliano" },
  { value: "/images/slice-floresta-negra.webp", label: "Floresta negra" },
  { value: "/images/slice-maracuja.webp", label: "Maracujá" },
  { value: "/images/slice-fuba.webp", label: "Fubá cremoso" },
];

const SECTIONS_META = [
  { key: "hero", label: "Hero animado", desc: "Carrossel de fatias em destaque na home" },
  { key: "fatias", label: "Fatias do dia", desc: "Grade com as 3 fatias principais" },
  { key: "vendidos", label: "Mais vendidos da semana", desc: "Carrossel horizontal de sabores" },
  { key: "bolosCta", label: "Chamada de bolos inteiros", desc: "Banner convidando para encomendas" },
] as const;

const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 12px", border: "1px solid #eaddd0", borderRadius: 10, fontSize: 14, fontFamily: "Inter" };
const smallLabelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#8b7d76", marginBottom: 6 };
const tableHeaderStyle: React.CSSProperties = { padding: "16px 22px", background: "#f7f1e8", fontSize: 12, fontWeight: 700, color: "#8b7d76", textTransform: "uppercase", letterSpacing: ".04em" };
const tableRowStyle: React.CSSProperties = { padding: "16px 22px", alignItems: "center", borderTop: "1px solid #eaddd0", fontSize: 14 };
const linkButtonStyle = (color: string): React.CSSProperties => ({ border: "none", background: "none", color, fontSize: 13, fontWeight: 600, cursor: "pointer" });

type Tab = "dashboard" | "produtos" | "secoes" | "pontos" | "pedidos" | "usuarios";
type AppUser = { id: string; name: string; email: string; role: "CUSTOMER" | "PARTNER" | "ADMIN"; createdAt: string; _count: { orders: number } };
type Analytics = {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  userCount: number;
  productCount: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  statusCounts: Record<string, number>;
  topProducts: { name: string; qty: number; revenue: number }[];
};

const ROLE_LABELS: Record<string, string> = { CUSTOMER: "Cliente", PARTNER: "Parceiro", ADMIN: "Admin" };

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sections, setSections] = useState<Record<string, boolean>>({ hero: true, fatias: true, vendidos: true, bolosCta: true });
  const [orders, setOrders] = useState<Order[]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [pontoForm, setPontoForm] = useState(EMPTY_PONTO_FORM);
  const [heroFlavors, setHeroFlavors] = useState<HeroFlavor[]>([]);
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchAnalytics();
    fetchHeroFlavors();
    fetchPontos();
    fetchSections();
  }, []);

  const fetchHeroFlavors = () => {
    fetch("/api/admin/hero-flavors")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setHeroFlavors(data))
      .catch(() => {});
  };
  const fetchPontos = () => {
    fetch("/api/admin/sales-points")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPontos(data))
      .catch(() => {});
  };
  const fetchSections = () => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSections((s) => {
          const next = { ...s };
          for (const sec of data) next[sec.key] = sec.enabled;
          return next;
        });
      })
      .catch(() => {});
  };

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProducts(data.map((p: Product) => ({ ...p, price: Number(p.price) }))))
      .catch(() => {});
  };
  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setOrders(data))
      .catch(() => {});
  };
  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUsers(data))
      .catch(() => {});
  };
  const fetchAnalytics = () => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => data && !data.error && setAnalytics(data))
      .catch(() => {});
  };
  const changeUserRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    if (res.ok) fetchUsers();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Não foi possível atualizar o papel do usuário.");
      fetchUsers();
    }
  };
  const removeUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Não foi possível excluir o usuário.");
    }
  };

  const updateHeroFlavor = (key: string, field: keyof HeroFlavor, value: string) => {
    setHeroFlavors((fs) => fs.map((f) => (f.key === key ? { ...f, [field]: value } : f)));
  };
  const saveHeroFlavor = async (key: string) => {
    const f = heroFlavors.find((fl) => fl.key === key);
    if (!f) return;
    await fetch("/api/admin/hero-flavors", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
  };
  const patchHeroFlavor = async (key: string, patch: Partial<HeroFlavor>) => {
    const updated = heroFlavors.map((f) => (f.key === key ? { ...f, ...patch } : f));
    setHeroFlavors(updated);
    const f = updated.find((fl) => fl.key === key);
    if (!f) return;
    await fetch("/api/admin/hero-flavors", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
  };
  const resetHero = async () => {
    const res = await fetch("/api/admin/hero-flavors", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (Array.isArray(data)) setHeroFlavors(data);
  };

  const submitPonto = async () => {
    const lat = parseFloat(pontoForm.lat);
    const lng = parseFloat(pontoForm.lng);
    if (!pontoForm.name.trim() || isNaN(lat) || isNaN(lng)) return;
    const body = JSON.stringify({ name: pontoForm.name, address: pontoForm.address, lat, lng });
    if (pontoForm.id) {
      await fetch(`/api/admin/sales-points/${pontoForm.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
    } else {
      await fetch("/api/admin/sales-points", { method: "POST", headers: { "Content-Type": "application/json" }, body });
    }
    setPontoForm(EMPTY_PONTO_FORM);
    fetchPontos();
  };
  const editPonto = (p: Ponto) => setPontoForm({ id: p.id, name: p.name, address: p.address, lat: String(p.lat), lng: String(p.lng) });
  const removePonto = async (id: string) => {
    await fetch(`/api/admin/sales-points/${id}`, { method: "DELETE" });
    fetchPontos();
  };

  const submitForm = async () => {
    if (!form.name.trim()) return;
    const price = parseFloat(form.price.replace(",", ".").replace(/[^\d.]/g, ""));
    const body = { name: form.name, category: form.category, price: isNaN(price) ? 0 : price, imageUrl: form.image || null };
    if (form.id) {
      await fetch(`/api/admin/products/${form.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setForm(EMPTY_FORM);
    fetchProducts();
  };
  const setFormImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Não foi possível enviar a imagem.");
        return;
      }
      setForm((f) => ({ ...f, image: data.url }));
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };
  const editProduct = (p: Product) => setForm({ id: p.id, name: p.name, price: String(p.price), category: p.category, image: p.imageUrl || "" });
  const removeProduct = async (id: string) => {
    // Deleting the product silently drops it from any customer carts (cascade)
    // and just unlinks it from past order history, which keeps its snapshot.
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };
  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    fetchProducts();
  };
  const toggleSection = async (key: string) => {
    const next = !sections[key];
    setSections((s) => ({ ...s, [key]: next }));
    await fetch("/api/admin/sections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, enabled: next }) });
  };
  const setOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchOrders();
  };

  return (
    <>
      <SimpleHeader variant="admin" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {(
            [
              { key: "dashboard", label: "Dashboard" },
              { key: "produtos", label: "Produtos" },
              { key: "secoes", label: "Seções da landing" },
              { key: "pontos", label: "Pontos de venda" },
              { key: "pedidos", label: "Pedidos" },
              { key: "usuarios", label: "Usuários" },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: tab === t.key ? "none" : "1px solid #eaddd0",
                padding: "11px 20px",
                borderRadius: 30,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: tab === t.key ? "#c1531c" : "#fff",
                color: tab === t.key ? "#fff" : "#8b7d76",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <>
            {!analytics ? (
              <p style={{ color: "#8b7d76" }}>Carregando...</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <StatTile label="Receita (30 dias)" value={"R$ " + analytics.totalRevenue.toFixed(2).replace(".", ",")} />
                  <StatTile label="Pedidos (30 dias)" value={String(analytics.totalOrders)} />
                  <StatTile label="Ticket médio" value={"R$ " + analytics.avgTicket.toFixed(2).replace(".", ",")} />
                  <StatTile label="Clientes cadastrados" value={String(analytics.userCount)} />
                  <StatTile label="Produtos ativos" value={String(analytics.productCount)} />
                </div>

                <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 24, marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 18px", color: "#c1531c" }}>Receita por dia — últimos 30 dias</h2>
                  <RevenueChart data={analytics.revenueByDay} />
                </div>

                <div className={styles.formRow} style={{ ...cssVars({ "--cols": "1fr 1fr" }), gap: 24, alignItems: "stretch" }}>
                  <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 24 }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 18px", color: "#c1531c" }}>Pedidos por status</h2>
                    <StatusBreakdown counts={analytics.statusCounts} />
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 24 }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 18px", color: "#c1531c" }}>Mais vendidos (30 dias)</h2>
                    <TopProductsChart items={analytics.topProducts} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {tab === "produtos" && (
          <>
            <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, margin: "0 0 18px", color: "#c1531c" }}>
                {form.id ? "Editar produto" : "Adicionar produto"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: "#f7f1e8", border: "1px dashed #eaddd0", overflow: "hidden", flexShrink: 0, display: "grid", placeItems: "center" }}>
                  {form.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image} alt="Prévia do produto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 10, color: "#8b7d76", textAlign: "center", padding: 4 }}>Sem foto</span>
                  )}
                </div>
                <label style={{ border: "1px solid #eaddd0", background: "#fff", color: "#c1531c", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: uploadingImage ? "wait" : "pointer", opacity: uploadingImage ? 0.6 : 1 }}>
                  {uploadingImage ? "Enviando..." : "Enviar foto do produto"}
                  <input type="file" accept="image/*" onChange={setFormImage} disabled={uploadingImage} style={{ display: "none" }} />
                </label>
              </div>
              <div className={styles.formRow} style={cssVars({ "--cols": "1.4fr 1fr 1fr auto" })}>
                <div>
                  <label style={smallLabelStyle}>Nome</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do produto" style={inputStyle} />
                </div>
                <div>
                  <label style={smallLabelStyle}>Preço</label>
                  <input type="text" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="R$ 0" style={inputStyle} />
                </div>
                <div>
                  <label style={smallLabelStyle}>Categoria</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, background: "#fff" }}>
                    <option value="Fatia">Fatia</option>
                    <option value="Bolo inteiro">Bolo inteiro</option>
                  </select>
                </div>
                <button onClick={submitForm} style={{ border: "none", background: "#c1531c", color: "#fff", borderRadius: 10, padding: "12px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer", height: 44 }}>
                  {form.id ? "Salvar" : "Adicionar"}
                </button>
              </div>
              {form.id && (
                <button onClick={() => setForm(EMPTY_FORM)} style={{ marginTop: 12, background: "none", border: "none", color: "#8b7d76", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                  Cancelar edição
                </button>
              )}
            </div>

            <div className={styles.productGrid}>
              {products.map((p) => (
                <div key={p.id} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 140, background: "#f7f1e8", display: "grid", placeItems: "center", overflow: "hidden" }}>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 12, color: "#8b7d76" }}>Sem foto</span>
                    )}
                  </div>
                  <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700, color: "#c1531c", fontSize: 15, lineHeight: 1.3 }}>{p.name}</div>
                      <button
                        onClick={() => toggleActive(p.id, p.active)}
                        style={{ flexShrink: 0, border: "none", borderRadius: 20, padding: "4px 11px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: p.active ? "#e3f0e6" : "#f2e4e4", color: p.active ? "#3d7a4a" : "#a05353" }}
                      >
                        {p.active ? "Ativo" : "Oculto"}
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#8b7d76" }}>
                      <span style={{ background: "#f7f1e8", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{p.category}</span>
                      <span style={{ fontWeight: 600, color: "#3f2a26" }}>R$ {p.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: "auto", paddingTop: 8, borderTop: "1px solid #eaddd0" }}>
                      <button onClick={() => editProduct(p)} style={linkButtonStyle("#a07882")}>
                        Editar
                      </button>
                      <button onClick={() => removeProduct(p.id)} style={linkButtonStyle("#b3554d")}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "secoes" && (
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, margin: "0 0 6px", color: "#c1531c" }}>Seções da página inicial</h2>
            <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 22px" }}>Ligue ou desligue blocos da home sem mexer no código.</p>
            {SECTIONS_META.map((m) => {
              const on = sections[m.key];
              const expandable = m.key === "hero";
              const expanded = expandable && heroExpanded;
              return (
                <div key={m.key} style={{ borderTop: "1px solid #eaddd0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
                    <div onClick={expandable ? () => setHeroExpanded((v) => !v) : undefined} style={{ cursor: expandable ? "pointer" : "default", flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#c1531c", fontSize: 15 }}>
                        {m.label}{" "}
                        {expandable && <span style={{ fontSize: 12, color: "#8b7d76", fontWeight: 400 }}>({heroExpanded ? "ocultar edição" : "editar textos, cor e produto"})</span>}
                      </div>
                      <div style={{ color: "#8b7d76", fontSize: 13 }}>{m.desc}</div>
                    </div>
                    <button
                      onClick={() => toggleSection(m.key)}
                      style={{ border: "none", width: 46, height: 26, borderRadius: 20, cursor: "pointer", position: "relative", transition: "background .2s ease", background: on ? "#c1531c" : "#e5dcd2" }}
                    >
                      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s ease", display: "block" }} />
                    </button>
                  </div>
                  {expanded && (
                    <div style={{ padding: "0 0 22px" }}>
                      {heroFlavors.map((fl) => (
                        <div key={fl.key} className={styles.formRow} style={{ ...cssVars({ "--cols": "1.2fr 1.6fr 0.8fr 0.7fr 1fr" }), background: "#f7f1e8", borderRadius: 14, padding: 16, marginBottom: 12, gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Nome</label>
                            <input type="text" value={fl.name} onChange={(e) => updateHeroFlavor(fl.key, "name", e.target.value)} onBlur={() => saveHeroFlavor(fl.key)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Descrição</label>
                            <input type="text" value={fl.desc} onChange={(e) => updateHeroFlavor(fl.key, "desc", e.target.value)} onBlur={() => saveHeroFlavor(fl.key)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Preço</label>
                            <input type="text" value={fl.price} onChange={(e) => updateHeroFlavor(fl.key, "price", e.target.value)} onBlur={() => saveHeroFlavor(fl.key)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Cor</label>
                            <input type="color" value={fl.bg} onChange={(e) => updateHeroFlavor(fl.key, "bg", e.target.value)} onBlur={() => saveHeroFlavor(fl.key)} style={{ width: "100%", height: 34, padding: 2, border: "1px solid #eaddd0", borderRadius: 8 }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Produto</label>
                            <select value={fl.img} onChange={(e) => patchHeroFlavor(fl.key, { img: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 12, fontFamily: "Inter", background: "#fff" }}>
                              {IMAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                      <button onClick={resetHero} style={{ border: "none", background: "none", color: "#8b7d76", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                        Restaurar padrão
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "pontos" && (
          <>
            <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, margin: "0 0 18px", color: "#c1531c" }}>Adicionar ponto de venda</h2>
              <div className={styles.formRow} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr auto" }), marginBottom: 14 }}>
                <div>
                  <label style={smallLabelStyle}>Nome do ponto</label>
                  <input type="text" value={pontoForm.name} onChange={(e) => setPontoForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Padaria Bela Vista" style={inputStyle} />
                </div>
                <div>
                  <label style={smallLabelStyle}>Latitude</label>
                  <input type="text" value={pontoForm.lat} onChange={(e) => setPontoForm((f) => ({ ...f, lat: e.target.value }))} placeholder="-23.5613" style={inputStyle} />
                </div>
                <div>
                  <label style={smallLabelStyle}>Longitude</label>
                  <input type="text" value={pontoForm.lng} onChange={(e) => setPontoForm((f) => ({ ...f, lng: e.target.value }))} placeholder="-46.6565" style={inputStyle} />
                </div>
                <button onClick={submitPonto} style={{ border: "none", background: "#c1531c", color: "#fff", borderRadius: 10, padding: "12px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer", height: 44 }}>
                  {pontoForm.id ? "Salvar" : "Adicionar"}
                </button>
              </div>
              <label style={smallLabelStyle}>Endereço</label>
              <input type="text" value={pontoForm.address} onChange={(e) => setPontoForm((f) => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro" style={{ ...inputStyle, marginBottom: 6 }} />
              <p style={{ fontSize: 12, color: "#8b7d76", margin: 0 }}>Dica: pegue latitude/longitude no Google Maps clicando com o botão direito no local.</p>
              {pontoForm.id && (
                <button onClick={() => setPontoForm(EMPTY_PONTO_FORM)} style={{ marginTop: 12, background: "none", border: "none", color: "#8b7d76", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                  Cancelar edição
                </button>
              )}
            </div>

            <div className={grid.tableScroll} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, overflow: "hidden" }}>
              <div className={`${styles.tableGrid} ${styles.tableHeaderRow}`} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr 2fr auto" }), ...tableHeaderStyle }}>
                <div>Nome</div>
                <div>Lat</div>
                <div>Lng</div>
                <div>Endereço</div>
                <div>Ações</div>
              </div>
              {pontos.map((p) => (
                <div key={p.id} className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr 2fr auto" }), ...tableRowStyle }}>
                  <div style={{ fontWeight: 600, color: "#c1531c" }}>{p.name}</div>
                  <div style={{ color: "#8b7d76" }}>{p.lat}</div>
                  <div style={{ color: "#8b7d76" }}>{p.lng}</div>
                  <div style={{ color: "#8b7d76" }}>{p.address}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => editPonto(p)} style={linkButtonStyle("#a07882")}>
                      Editar
                    </button>
                    <button onClick={() => removePonto(p.id)} style={linkButtonStyle("#b3554d")}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "pedidos" && (
          <div className={grid.tableScroll} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, overflow: "hidden" }}>
            <div className={`${styles.tableGrid} ${styles.tableHeaderRow}`} style={{ ...cssVars({ "--cols": "1fr 1.4fr 1fr 1fr 1fr" }), ...tableHeaderStyle }}>
              <div>Pedido</div>
              <div>Cliente</div>
              <div>Item</div>
              <div>Data</div>
              <div>Status</div>
            </div>
            {orders.length === 0 && (
              <div style={{ padding: "22px", color: "#8b7d76", fontSize: 14 }}>Nenhum pedido ainda.</div>
            )}
            {orders.map((o) => (
              <div key={o.id} className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1fr 1.4fr 1fr 1fr 1fr" }), ...tableRowStyle }}>
                <div style={{ fontWeight: 600, color: "#c1531c" }}>{o.code}</div>
                <div style={{ color: "#8b7d76" }}>{o.user?.name || "-"}</div>
                <div style={{ color: "#8b7d76" }}>{o.items.map((i) => `${i.qty}x ${i.nameSnapshot}`).join(", ")}</div>
                <div style={{ color: "#8b7d76" }}>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
                <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} style={{ padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter", background: "#f5ead9" }}>
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {tab === "usuarios" && (
          <div className={grid.tableScroll} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, overflow: "hidden" }}>
            <div className={`${styles.tableGrid} ${styles.tableHeaderRow}`} style={{ ...cssVars({ "--cols": "1.4fr 1.6fr 1fr 0.8fr 1fr auto" }), ...tableHeaderStyle }}>
              <div>Nome</div>
              <div>E-mail</div>
              <div>Papel</div>
              <div style={{ textAlign: "center" }}>Pedidos</div>
              <div>Desde</div>
              <div>Ações</div>
            </div>
            {users.length === 0 && (
              <div style={{ padding: "22px", color: "#8b7d76", fontSize: 14 }}>Nenhum usuário ainda.</div>
            )}
            {users.map((u) => (
              <div key={u.id} className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1.4fr 1.6fr 1fr 0.8fr 1fr auto" }), ...tableRowStyle }}>
                <div style={{ fontWeight: 600, color: "#c1531c" }}>{u.name}</div>
                <div style={{ color: "#8b7d76" }}>{u.email}</div>
                <select
                  value={u.role}
                  onChange={(e) => changeUserRole(u.id, e.target.value)}
                  style={{ padding: "6px 8px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 12, fontFamily: "Inter", background: "#f5ead9" }}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div style={{ color: "#8b7d76", textAlign: "center" }}>{u._count.orders}</div>
                <div style={{ color: "#8b7d76" }}>{new Date(u.createdAt).toLocaleDateString("pt-BR")}</div>
                <button onClick={() => removeUser(u.id)} style={linkButtonStyle("#b3554d")}>
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
