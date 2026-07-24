"use client";

import { useEffect, useState } from "react";
import { SimpleHeader } from "@/components/layout/SimpleHeader";
import grid from "@/styles/grid.module.css";
import styles from "./Dashboard.module.css";

const cssVars = (vars: Record<string, string>) => vars as React.CSSProperties;

type Product = { id: number; name: string; category: string; price: string; image?: string; active: boolean };
type Order = { id: number; code: string; customer: string; item: string; date: string; status: string };
type Ponto = { id: number; name: string; address: string; lat: number; lng: number };
type HeroFlavor = { key: string; name: string; desc: string; price: string; img: string; bg: string };

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Chocolate intenso", category: "Fatia", price: "R$ 12,00", active: true },
  { id: 2, name: "Red velvet", category: "Fatia", price: "R$ 14,00", active: true },
  { id: 3, name: "Cenoura com chocolate", category: "Fatia", price: "R$ 10,00", active: true },
  { id: 4, name: "Prestígio", category: "Fatia", price: "R$ 13,00", active: true },
  { id: 5, name: "Ninho com Nutella", category: "Fatia", price: "R$ 15,00", active: true },
  { id: 6, name: "Bolo de aniversário", category: "Bolo inteiro", price: "R$ 75,00 – R$ 180,00", active: true },
  { id: 7, name: "Bolo de festa", category: "Bolo inteiro", price: "R$ 75,00 – R$ 180,00", active: true },
];

const INITIAL_ORDERS: Order[] = [
  { id: 1, code: "#1042", customer: "Ana Paula", item: "Bolo G · Red velvet", date: "24/07", status: "Em preparo" },
  { id: 2, code: "#1041", customer: "Carlos Meira", item: "4x Fatia chocolate", date: "23/07", status: "Entregue" },
  { id: 3, code: "#1040", customer: "Juliana Reis", item: "Bolo M · Ninho", date: "23/07", status: "Pronto" },
  { id: 4, code: "#1039", customer: "Rafael Costa", item: "2x Fatia maracujá", date: "22/07", status: "Pendente" },
  { id: 5, code: "#1038", customer: "Fernanda Lima", item: "Bolo P · Cenoura", date: "21/07", status: "Entregue" },
];

const EMPTY_FORM = { id: null as number | null, name: "", price: "", category: "Fatia", image: "" };
const DEFAULT_PONTOS: Ponto[] = [
  { id: 1, name: "Marta Confeitaria — Cozinha principal", address: "Rua das Framboesas, 122 — Centro, Salgueiro - PE", lat: -8.0742, lng: -39.1225 },
  { id: 2, name: "Padaria Bela Vista", address: "Av. Antônio Gomes Sobrinho — Salgueiro - PE", lat: -8.0698, lng: -39.1187 },
  { id: 3, name: "Empório Vila Doce", address: "Rua Cel. José Ozanan — Salgueiro - PE", lat: -8.0781, lng: -39.1274 },
];
const EMPTY_PONTO_FORM = { id: null as number | null, name: "", address: "", lat: "", lng: "" };

const DEFAULT_HERO_FLAVORS: HeroFlavor[] = [
  { key: "choc", name: "Chocolate intenso", desc: "Camadas de bolo de chocolate úmido com recheio cremoso de brigadeiro de colher.", price: "R$ 12,00", img: "/images/slice-chocolate.webp", bg: "#3a211c" },
  { key: "red", name: "Red velvet", desc: "Massa aveludada vermelha com recheio de cream cheese e um toque de baunilha.", price: "R$ 14,00", img: "/images/slice-red-velvet.webp", bg: "#4a1620" },
  { key: "carrot", name: "Cenoura com chocolate", desc: "Bolo de cenoura fofinho coberto com brigadeiro de chocolate na medida certa.", price: "R$ 10,00", img: "/images/slice-cenoura.webp", bg: "#5a3410" },
];

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

type Tab = "produtos" | "secoes" | "pontos" | "pedidos";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("produtos");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sections, setSections] = useState<Record<string, boolean>>({ hero: true, fatias: true, vendidos: true, bolosCta: true });
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [pontos, setPontos] = useState<Ponto[]>(DEFAULT_PONTOS);
  const [pontoForm, setPontoForm] = useState(EMPTY_PONTO_FORM);
  const [heroFlavors, setHeroFlavors] = useState<HeroFlavor[]>(DEFAULT_HERO_FLAVORS);
  const [heroExpanded, setHeroExpanded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("martaPontosVenda") || "null");
      if (stored && stored.length) setPontos(stored);
    } catch {}
    try {
      const storedHero = JSON.parse(localStorage.getItem("martaHeroFlavors") || "null");
      if (storedHero && storedHero.length) setHeroFlavors(storedHero);
    } catch {}
  }, []);

  const persistHero = (next: HeroFlavor[]) => {
    setHeroFlavors(next);
    try {
      localStorage.setItem("martaHeroFlavors", JSON.stringify(next));
    } catch {}
  };
  const updateHeroFlavor = (key: string, field: keyof HeroFlavor, value: string) => {
    persistHero(heroFlavors.map((f) => (f.key === key ? { ...f, [field]: value } : f)));
  };
  const resetHero = () => persistHero(DEFAULT_HERO_FLAVORS);

  const persistPontos = (next: Ponto[]) => {
    setPontos(next);
    try {
      localStorage.setItem("martaPontosVenda", JSON.stringify(next));
    } catch {}
  };
  const submitPonto = () => {
    const lat = parseFloat(pontoForm.lat);
    const lng = parseFloat(pontoForm.lng);
    if (!pontoForm.name.trim() || isNaN(lat) || isNaN(lng)) return;
    if (pontoForm.id) {
      persistPontos(pontos.map((p) => (p.id === pontoForm.id ? { ...p, name: pontoForm.name, address: pontoForm.address, lat, lng } : p)));
    } else {
      persistPontos([...pontos, { id: Date.now(), name: pontoForm.name, address: pontoForm.address, lat, lng }]);
    }
    setPontoForm(EMPTY_PONTO_FORM);
  };
  const editPonto = (p: Ponto) => setPontoForm({ id: p.id, name: p.name, address: p.address, lat: String(p.lat), lng: String(p.lng) });
  const removePonto = (id: number) => persistPontos(pontos.filter((p) => p.id !== id));

  const submitForm = () => {
    if (!form.name.trim()) return;
    if (form.id) {
      setProducts(products.map((p) => (p.id === form.id ? { ...p, name: form.name, price: form.price, category: form.category, image: form.image } : p)));
    } else {
      setProducts([...products, { id: Date.now(), name: form.name, price: form.price, category: form.category, image: form.image, active: true }]);
    }
    setForm(EMPTY_FORM);
  };
  const setFormImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const editProduct = (p: Product) => setForm({ id: p.id, name: p.name, price: p.price, category: p.category, image: p.image || "" });
  const removeProduct = (id: number) => setProducts(products.filter((p) => p.id !== id));
  const toggleActive = (id: number) => setProducts(products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  const toggleSection = (key: string) => setSections((s) => ({ ...s, [key]: !s[key] }));
  const setOrderStatus = (id: number, status: string) => setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));

  return (
    <>
      <SimpleHeader variant="admin" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {(
            [
              { key: "produtos", label: "Produtos" },
              { key: "secoes", label: "Seções da landing" },
              { key: "pontos", label: "Pontos de venda" },
              { key: "pedidos", label: "Pedidos" },
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
                <label style={{ border: "1px solid #eaddd0", background: "#fff", color: "#c1531c", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Enviar foto do produto
                  <input type="file" accept="image/*" onChange={setFormImage} style={{ display: "none" }} />
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

            <div className={grid.tableScroll} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 18, overflow: "hidden" }}>
              <div className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr 1fr auto" }), ...tableHeaderStyle }}>
                <div>Nome</div>
                <div>Categoria</div>
                <div>Preço</div>
                <div>Status</div>
                <div>Ações</div>
              </div>
              {products.map((p) => (
                <div key={p.id} className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr 1fr auto" }), ...tableRowStyle }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, color: "#c1531c" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "#f7f1e8", overflow: "hidden", flexShrink: 0, display: "grid", placeItems: "center" }}>
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </span>
                    {p.name}
                  </div>
                  <div style={{ color: "#8b7d76" }}>{p.category}</div>
                  <div style={{ color: "#8b7d76" }}>{p.price}</div>
                  <div>
                    <button
                      onClick={() => toggleActive(p.id)}
                      style={{ border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: p.active ? "#e3f0e6" : "#f2e4e4", color: p.active ? "#3d7a4a" : "#a05353" }}
                    >
                      {p.active ? "Ativo" : "Oculto"}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => editProduct(p)} style={linkButtonStyle("#a07882")}>
                      Editar
                    </button>
                    <button onClick={() => removeProduct(p.id)} style={linkButtonStyle("#b3554d")}>
                      Excluir
                    </button>
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
                            <input type="text" value={fl.name} onChange={(e) => updateHeroFlavor(fl.key, "name", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Descrição</label>
                            <input type="text" value={fl.desc} onChange={(e) => updateHeroFlavor(fl.key, "desc", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Preço</label>
                            <input type="text" value={fl.price} onChange={(e) => updateHeroFlavor(fl.key, "price", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Cor</label>
                            <input type="color" value={fl.bg} onChange={(e) => updateHeroFlavor(fl.key, "bg", e.target.value)} style={{ width: "100%", height: 34, padding: 2, border: "1px solid #eaddd0", borderRadius: 8 }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8b7d76", marginBottom: 5 }}>Produto</label>
                            <select value={fl.img} onChange={(e) => updateHeroFlavor(fl.key, "img", e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 12, fontFamily: "Inter", background: "#fff" }}>
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
              <div className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1.6fr 1fr 1fr 2fr auto" }), ...tableHeaderStyle }}>
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
            <div className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1fr 1.4fr 1fr 1fr 1fr" }), ...tableHeaderStyle }}>
              <div>Pedido</div>
              <div>Cliente</div>
              <div>Item</div>
              <div>Data</div>
              <div>Status</div>
            </div>
            {orders.map((o) => (
              <div key={o.id} className={styles.tableGrid} style={{ ...cssVars({ "--cols": "1fr 1.4fr 1fr 1fr 1fr" }), ...tableRowStyle }}>
                <div style={{ fontWeight: 600, color: "#c1531c" }}>{o.code}</div>
                <div style={{ color: "#8b7d76" }}>{o.customer}</div>
                <div style={{ color: "#8b7d76" }}>{o.item}</div>
                <div style={{ color: "#8b7d76" }}>{o.date}</div>
                <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} style={{ padding: "8px 10px", border: "1px solid #eaddd0", borderRadius: 8, fontSize: 13, fontFamily: "Inter", background: "#fbf7f0" }}>
                  <option>Pendente</option>
                  <option>Em preparo</option>
                  <option>Pronto</option>
                  <option>Entregue</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
