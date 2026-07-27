import { describe, it, expect, vi, beforeEach } from "vitest";

const auth = vi.fn();
const productFindFirst = vi.fn();
const cartFindUnique = vi.fn();
const cartUpsert = vi.fn();

vi.mock("@/auth", () => ({ auth: () => auth() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: (...a: unknown[]) => productFindFirst(...a) },
    cartItem: {
      findUnique: (...a: unknown[]) => cartFindUnique(...a),
      upsert: (...a: unknown[]) => cartUpsert(...a),
    },
  },
}));
vi.mock("@/lib/activityLog", () => ({ logActivity: async () => {} }));

const { POST } = await import("@/app/api/cart/route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));

beforeEach(() => {
  auth.mockResolvedValue({ user: { id: "u1" } });
  productFindFirst.mockResolvedValue({ id: "p1", name: "Red velvet", price: 14, stock: null });
  cartFindUnique.mockResolvedValue(null);
  cartUpsert.mockResolvedValue({ id: "ci1", qty: 1 });
});

describe("POST /api/cart", () => {
  it("exige autenticação", async () => {
    auth.mockResolvedValue(null);
    const res = await post({ productId: "p1", qty: 1 });
    expect(res.status).toBe(401);
  });

  it("recusa sem productId", async () => {
    const res = await post({ qty: 1 });
    expect(res.status).toBe(400);
  });

  it("não aceita mais o nome no lugar do id", async () => {
    const res = await post({ name: "Red velvet", qty: 1 });
    expect(res.status).toBe(400);
  });

  it("recusa quantidade zero ou negativa", async () => {
    expect((await post({ productId: "p1", qty: 0 })).status).toBe(400);
    expect((await post({ productId: "p1", qty: -3 })).status).toBe(400);
  });

  it("recusa quantidade acima do teto por item", async () => {
    const res = await post({ productId: "p1", qty: 100 });
    expect(res.status).toBe(400);
  });

  it("responde 404 quando o produto não existe ou está inativo", async () => {
    productFindFirst.mockResolvedValue(null);
    const res = await post({ productId: "sumiu", qty: 1 });
    expect(res.status).toBe(404);
  });

  it("recusa com 409 e informa o disponível quando o estoque não cobre", async () => {
    productFindFirst.mockResolvedValue({ id: "p1", name: "Red velvet", price: 14, stock: 2 });
    cartFindUnique.mockResolvedValue({ qty: 2 });
    const res = await post({ productId: "p1", qty: 1 });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.available).toBe(2);
    expect(body.error).toMatch(/estoque/i);
  });

  it("aceita quando o estoque cobre a soma com o que já estava no carrinho", async () => {
    productFindFirst.mockResolvedValue({ id: "p1", name: "Red velvet", price: 14, stock: 5 });
    cartFindUnique.mockResolvedValue({ qty: 2 });
    const res = await post({ productId: "p1", qty: 3 });
    expect(res.status).toBe(200);
    expect(cartUpsert).toHaveBeenCalled();
  });

  it("trata estoque nulo como ilimitado", async () => {
    cartFindUnique.mockResolvedValue({ qty: 50 });
    const res = await post({ productId: "p1", qty: 40 });
    expect(res.status).toBe(200);
  });
});
