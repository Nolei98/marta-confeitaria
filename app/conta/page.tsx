"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { VerifyEmailBanner } from "@/components/account/VerifyEmailBanner";
import { EncomendaForm } from "@/components/account/EncomendaForm";
import { LoadingScreen } from "@/components/ui/Loading";
import { useCart } from "@/components/cart/CartContext";
import { useHoverStyle } from "@/lib/useHover";
import { UserIcon, EditIcon, LogOutIcon, BoxIcon, CakeSliceIcon, CupcakeIcon } from "@/components/icons";
import grid from "@/styles/grid.module.css";

type OrderItem = { id: string; nameSnapshot: string; priceSnapshot: string; qty: number };
type Order = { id: string; code: string; status: string; paymentStatus: string; total: string; createdAt: string; items: OrderItem[] };

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
};
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pagamento pendente",
  IN_PROCESS: "Pagamento em análise",
  APPROVED: "Pagamento aprovado",
  REJECTED: "Pagamento recusado",
  CANCELLED: "Pagamento cancelado",
  REFUNDED: "Pagamento reembolsado",
};
type Product = { id: string; name: string; category: string; price: number; imageUrl: string | null };
type View = "catalogo" | "encomenda" | "pedidos" | "editar";

const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid #eaddd0", borderRadius: 12, fontSize: 15, marginBottom: 16, background: "#f5ead9", fontFamily: "Inter" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#3f2a26", marginBottom: 6 };

function newCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

function SubmitButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const hover = useHoverStyle(
    { width: "100%", border: "none", background: "#c1531c", color: "#fff", borderRadius: 40, padding: 15, fontWeight: 600, fontSize: 15, cursor: "pointer", minHeight: 44, marginTop: 12, opacity: disabled ? 0.6 : 1 },
    { background: "#9c3f14" }
  );
  return (
    <button onClick={onClick} disabled={disabled} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

function EncomendarBoloCta({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { border: "none", background: "#c1531c", color: "#fff", borderRadius: 30, padding: "12px 22px", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", cursor: "pointer", transition: "transform .2s ease, background-color .2s ease" },
    { background: "#8a6470", transform: "scale(1.15)" }
  );
  return (
    <button onClick={onClick} {...hover.handlers} style={hover.style}>
      Encomendar bolo
    </button>
  );
}

function ProfileIconButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  const hover = useHoverStyle(
    { display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", border: active ? "none" : "1px solid #eaddd0", background: active ? "#c1531c" : "#fff", color: active ? "#fff" : "#8b7d76", cursor: "pointer" },
    active ? {} : { borderColor: "#c1531c", color: "#c1531c" }
  );
  return (
    <button onClick={onClick} title={label} aria-label={label} {...hover.handlers} style={hover.style}>
      {children}
    </button>
  );
}

const PEDESTAL_COLORS = ["#f6d9dd", "#e6dcef", "#f3e2cf"];

function ProductImg({ src, alt }: { src: string; alt: string }) {
  const hover = useHoverStyle(
    { position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", height: 92, objectFit: "contain", filter: "drop-shadow(0 12px 10px rgba(58,33,28,.24))", transition: "transform .25s ease-out" },
    { transform: "translateX(-50%) translateY(-6px) scale(1.08)" }
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...hover.handlers} style={hover.style} />;
}

function AddButton({ onClick }: { onClick: () => void }) {
  const hover = useHoverStyle(
    { border: "none", background: "#c1531c", color: "#fff", width: 28, height: 28, borderRadius: "50%", fontSize: 15, cursor: "pointer", fontWeight: 700, transition: "transform .2s ease, background-color .2s ease" },
    { background: "#8a6470", transform: "scale(1.18)" }
  );
  return (
    <button onClick={onClick} aria-label="Adicionar ao carrinho" {...hover.handlers} style={hover.style}>
      +
    </button>
  );
}

function ProductCard({ p, index, onAdd }: { p: Product; index: number; onAdd: () => void }) {
  const bg = PEDESTAL_COLORS[index % PEDESTAL_COLORS.length];
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", background: bg, borderRadius: 14, padding: "58px 10px 14px", marginTop: 34 }}>
        {p.imageUrl && <ProductImg src={p.imageUrl} alt={p.name} />}
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#3f2a26", fontSize: 16, lineHeight: 1.25, letterSpacing: ".01em" }}>{p.name}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 }}>
        <span style={{ fontWeight: 700, color: "#c1531c", fontSize: 13 }}>R$ {p.price.toFixed(2).replace(".", ",")}</span>
        <AddButton onClick={onAdd} />
      </div>
    </div>
  );
}

export default function ContaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");

  const [view, setView] = useState<View>("catalogo");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [verifyBanner, setVerifyBanner] = useState<"success" | "error" | null>(null);

  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);

  useEffect(() => {
    setCaptcha(newCaptcha());
    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    if (verify === "success" || verify === "error") setVerifyBanner(verify);
    if (params.get("view") === "encomenda") setView("encomenda");
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role === "PARTNER") {
      router.replace("/parceiro");
      return;
    }
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }
    fetch("/api/orders").then((r) => r.json()).then((data) => Array.isArray(data) && setOrders(data)).catch(() => {});
    fetch("/api/public/products").then((r) => r.json()).then((data) => Array.isArray(data) && setProducts(data.filter((p: Product) => p.category === "Fatia"))).catch(() => {});
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setProfile({ name: data.name, phone: data.phone || "" });
        if (data?.email) setNewEmail(data.email);
        setAvatarUrl(data?.avatarUrl || null);
      })
      .catch(() => {});
  }, [status]);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAvatarError(data.error || "Não foi possível enviar a foto.");
        return;
      }
      setAvatarUrl(data.url);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const isSignup = mode === "signup";

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (isSignup && (!captcha || parseInt(captchaInput, 10) !== captcha.a + captcha.b)) {
      setError("Confirmação incorreta — resolva a soma pra provar que você não é um robô.");
      setCaptcha(newCaptcha());
      setCaptchaInput("");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isSignup) {
        if (!name.trim()) {
          setError("Preencha seu nome.");
          return;
        }
        if (!signupPhone.trim()) {
          setError("Preencha seu telefone.");
          return;
        }
        if (!acceptedTerms) {
          setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
          return;
        }
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone: signupPhone }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Não foi possível criar a conta.");
          setCaptcha(newCaptcha());
          setCaptchaInput("");
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      setProfileMsg("Preencha seu nome.");
      return;
    }
    setProfileBusy(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({}));
      setProfileMsg(res.ok ? "Dados salvos!" : data.error || "Não foi possível salvar.");
    } finally {
      setProfileBusy(false);
    }
  };

  const saveSecurity = async () => {
    if (!currentPassword) {
      setSecurityError("Informe sua senha atual pra confirmar a alteração.");
      return;
    }
    setSecurityBusy(true);
    setSecurityError("");
    setSecurityMsg("");
    try {
      const res = await fetch("/api/account/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, email: newEmail, newPassword: newPassword || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSecurityError(data.error || "Não foi possível salvar.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      if (data.emailChanged) {
        setSecurityMsg("E-mail alterado! Faça login novamente com o novo e-mail.");
        setTimeout(() => signOut({ callbackUrl: "/conta" }), 2000);
      } else {
        setSecurityMsg("Dados de acesso atualizados!");
      }
    } finally {
      setSecurityBusy(false);
    }
  };

  const redirectingAway = status === "authenticated" && (session?.user?.role === "PARTNER" || session?.user?.role === "ADMIN");

  if (status === "loading" || redirectingAway) {
    return (
      <>
        <SiteHeader />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      {verifyBanner && (
        <div style={{ maxWidth: 900, margin: "24px auto 0", padding: "0 24px" }}>
          <div
            style={{
              background: verifyBanner === "success" ? "#e3f0e6" : "#f2e4e4",
              color: verifyBanner === "success" ? "#3d7a4a" : "#a05353",
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {verifyBanner === "success" ? "E-mail confirmado com sucesso!" : "Link de confirmação inválido ou expirado."}
          </div>
        </div>
      )}

      {session?.user ? (
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
          <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f6d9dd", display: "grid", placeItems: "center", fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#c1531c", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (session.user.name || session.user.email || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, margin: "0 0 2px" }}>Oi, {session.user.name}! Que bom te ver por aqui.</h1>
                <p style={{ color: "#8b7d76", fontSize: 13, margin: 0 }}>{session.user.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <ProfileIconButton onClick={() => setView("catalogo")} active={view === "catalogo"} label="Catálogo">
                <CakeSliceIcon size={17} />
              </ProfileIconButton>
              <ProfileIconButton onClick={() => setView("encomenda")} active={view === "encomenda"} label="Encomendar bolo">
                <CupcakeIcon size={17} />
              </ProfileIconButton>
              <ProfileIconButton onClick={() => setView("pedidos")} active={view === "pedidos"} label="Meus pedidos">
                <BoxIcon size={17} />
              </ProfileIconButton>
              <ProfileIconButton onClick={() => setView("editar")} active={view === "editar"} label="Editar conta">
                <EditIcon size={17} />
              </ProfileIconButton>
              <ProfileIconButton onClick={() => signOut({ callbackUrl: "/conta" })} label="Sair">
                <LogOutIcon size={17} />
              </ProfileIconButton>
            </div>
          </div>

          {!session.user.emailConfirmed && verifyBanner !== "success" && <VerifyEmailBanner />}

          {view === "catalogo" && (
            <>
              <div style={{ background: "#3f2a26", borderRadius: 20, padding: "22px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>Sob encomenda</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 19, margin: 0 }}>Quer um bolo inteiro pra uma festa?</h2>
                </div>
                <EncomendarBoloCta onClick={() => setView("encomenda")} />
              </div>

              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Fatias do catálogo</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "28px 16px" }}>
                {products.map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i} onAdd={() => addToCart(p.name, p.price)} />
                ))}
                {products.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Catálogo indisponível no momento.</p>}
              </div>
            </>
          )}

          {view === "encomenda" && <EncomendaForm />}

          {view === "pedidos" && (
            <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, textAlign: "left" }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Histórico de pedidos</h2>
              {orders.length === 0 && <p style={{ color: "#8b7d76", fontSize: 14 }}>Nenhum pedido ainda.</p>}
              {orders.map((o) => (
                <div key={o.id} style={{ borderTop: "1px solid #eaddd0", padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#3f2a26", fontSize: 14 }}>
                    <span>{o.code}</span>
                    <span>R$ {Number(o.total).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#8b7d76", margin: "4px 0" }}>
                    {o.items.map((i) => `${i.qty}x ${i.nameSnapshot}`).join(" · ")}
                  </div>
                  <div style={{ fontSize: 12, color: "#a07882" }}>
                    {ORDER_STATUS_LABELS[o.status] ?? o.status} · {PAYMENT_STATUS_LABELS[o.paymentStatus] ?? o.paymentStatus} · {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "editar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, textAlign: "left" }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Foto de perfil</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f6d9dd", display: "grid", placeItems: "center", fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#c1531c", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (profile.name || session.user.email || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <label style={{ border: "1px solid #eaddd0", background: "#fff", color: "#c1531c", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: avatarUploading ? "wait" : "pointer", opacity: avatarUploading ? 0.6 : 1 }}>
                    {avatarUploading ? "Enviando..." : "Trocar foto"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={avatarUploading} style={{ display: "none" }} />
                  </label>
                </div>
                <p style={{ color: "#8b7d76", fontSize: 12, margin: "0 0 4px" }}>JPG, PNG ou WEBP, até 2MB.</p>
                {avatarError && <p style={{ color: "#b3554d", fontSize: 13, margin: 0 }}>{avatarError}</p>}
              </div>

              <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, textAlign: "left" }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 14px", color: "#c1531c" }}>Dados da conta</h2>
                <label style={labelStyle}>Nome completo</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
                <label style={labelStyle}>Telefone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="(00) 00000-0000" style={inputStyle} />
                {profileMsg && <p style={{ color: profileMsg === "Dados salvos!" ? "#3d7a4a" : "#b3554d", fontSize: 13, margin: "0 0 8px" }}>{profileMsg}</p>}
                <SubmitButton onClick={saveProfile} disabled={profileBusy}>Salvar dados</SubmitButton>
              </div>

              <div style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24, padding: 24, textAlign: "left" }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "0 0 6px", color: "#c1531c" }}>E-mail e senha</h2>
                <p style={{ color: "#8b7d76", fontSize: 13, margin: "0 0 16px" }}>Pra alterar, confirme sua senha atual.</p>
                <label style={labelStyle}>E-mail</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Nova senha (opcional)</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe em branco pra manter a atual" style={inputStyle} />
                <label style={labelStyle}>Senha atual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, marginBottom: 8 }} />
                {securityError && <p style={{ color: "#b3554d", fontSize: 13, margin: "0 0 8px" }}>{securityError}</p>}
                {securityMsg && <p style={{ color: "#3d7a4a", fontSize: 13, margin: "0 0 8px" }}>{securityMsg}</p>}
                <SubmitButton onClick={saveSecurity} disabled={securityBusy}>Salvar acesso</SubmitButton>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section style={{ maxWidth: 440, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div className={grid.formPanel} style={{ background: "#fff", border: "1px solid #eaddd0", borderRadius: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 26, background: "#f7f1e8", borderRadius: 30, padding: 4 }}>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={{ flex: 1, border: "none", padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 600, cursor: "pointer", background: !isSignup ? "#c1531c" : "transparent", color: !isSignup ? "#fff" : "#8b7d76" }}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                style={{ flex: 1, border: "none", padding: 10, borderRadius: 26, fontSize: 14, fontWeight: 600, cursor: "pointer", background: isSignup ? "#c1531c" : "transparent", color: isSignup ? "#fff" : "#8b7d76" }}
              >
                Criar conta
              </button>
            </div>

            {isSignup && (
              <>
                <label style={labelStyle}>Nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" style={inputStyle} />
                <label style={labelStyle}>Telefone</label>
                <input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
              </>
            )}

            <label style={labelStyle}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />

            <label style={labelStyle}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, marginBottom: 8 }} />

            {!isSignup && (
              <Link href="/esqueci-senha" style={{ display: "inline-block", color: "#a07882", fontSize: 13, textDecoration: "underline", marginBottom: 4 }}>
                Esqueci minha senha
              </Link>
            )}

            {isSignup && (
              <>
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
              </>
            )}

            {error && <p style={{ color: "#b3554d", fontSize: 13, margin: "6px 0 0" }}>{error}</p>}

            {isSignup && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "18px 0", fontSize: 13, color: "#8b7d76", cursor: "pointer" }}>
                <input type="checkbox" checked={acceptedTerms} onChange={() => setAcceptedTerms((v) => !v)} style={{ marginTop: 2 }} />
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" style={{ color: "#c1531c", textDecoration: "underline" }}>
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" style={{ color: "#c1531c", textDecoration: "underline" }}>
                  Política de Privacidade
                </Link>
                .
              </label>
            )}

            <SubmitButton onClick={submit} disabled={busy}>{isSignup ? "Criar conta" : "Entrar"}</SubmitButton>

            <p style={{ textAlign: "center", color: "#8b7d76", fontSize: 12, margin: "20px 0 0" }}>
              Comprar sem login sempre foi possível — a conta é só pra quem quer histórico, promoções e avisos por e-mail.
            </p>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
