import { describe, it, expect, vi, beforeEach } from "vitest";

// Toda a validação abaixo roda no servidor. A tela também valida, mas é esta
// camada que garante — quem chamar a API direto passa por aqui.
const auth = vi.fn(async () => null as unknown);
const findFirst = vi.fn();

vi.mock("@/auth", () => ({ auth: () => auth() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: (...a: unknown[]) => findFirst(...a) },
    loginAttempt: { count: async () => 0, create: async () => ({}), deleteMany: async () => ({}) },
    $transaction: async () => [],
  },
}));
vi.mock("@/lib/activityLog", () => ({ logActivity: async () => {} }));
vi.mock("@/lib/mercadopago", () => ({ getPreferenceClient: async () => null }));
vi.mock("@/lib/rateLimit", () => ({
  isRateLimited: async () => false,
  recordAttempt: async () => {},
  clientIp: () => "1.2.3.4",
}));

const { POST } = await import("@/app/api/checkout/route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));

const produto = { id: "p1", name: "Red velvet", price: 14, stock: null };
const itens = [{ id: "p1", name: "Red velvet", qty: 1 }];

beforeEach(() => {
  auth.mockResolvedValue(null);
  findFirst.mockResolvedValue(produto);
});

describe("checkout de visitante — validação no servidor", () => {
  it("recusa sem nome", async () => {
    const res = await post({ items: itens, guestPhone: "87999999999" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/nome/i);
  });

  it("recusa sem telefone", async () => {
    const res = await post({ items: itens, guestName: "Ana Paula" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/WhatsApp/i);
  });

  it("recusa telefone curto demais para ter DDD", async () => {
    const res = await post({ items: itens, guestName: "Ana", guestPhone: "99999" });
    expect(res.status).toBe(400);
  });

  it("recusa e-mail malformado quando informado", async () => {
    const res = await post({
      items: itens, guestName: "Ana", guestPhone: "87999999999", guestEmail: "nao-eh-email",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/mail/i);
  });

  it("recusa carrinho vazio", async () => {
    const res = await post({ items: [], guestName: "Ana", guestPhone: "87999999999" });
    expect(res.status).toBe(400);
  });

  it("recusa item com id de produto inexistente", async () => {
    findFirst.mockResolvedValue(null);
    const res = await post({
      items: [{ id: "sumiu", name: "Fantasma", qty: 1 }],
      guestName: "Ana", guestPhone: "87999999999",
    });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/não está mais disponível/i);
  });

  it("ignora item sem id — o nome sozinho não basta", async () => {
    const res = await post({
      items: [{ name: "Red velvet", qty: 1 }],
      guestName: "Ana", guestPhone: "87999999999",
    });
    expect(res.status).toBe(400);
  });

  it("recusa quantidade não inteira", async () => {
    const res = await post({
      items: [{ id: "p1", qty: 1.5 }],
      guestName: "Ana", guestPhone: "87999999999",
    });
    expect(res.status).toBe(400);
  });

  it("recusa carrinho com linhas demais", async () => {
    const res = await post({
      items: Array.from({ length: 41 }, (_, i) => ({ id: "p" + i, qty: 1 })),
      guestName: "Ana", guestPhone: "87999999999",
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/itens demais/i);
  });
});
