// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The cart only talks to the server for logged-in customers.
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Marta" } }, status: "authenticated" }),
}));

import { CartProvider, useCart } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** Opens the drawer with one item already in it, so tests can act on a real cart. */
function Harness() {
  const { addToCart } = useCart();
  return (
    <>
      <button onClick={() => addToCart("Red velvet", 14)}>add</button>
      <CartDrawer />
    </>
  );
}

const renderCart = () =>
  render(
    <CartProvider>
      <Harness />
    </CartProvider>
  );

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // jsdom refuses real navigation; capture the assignment instead.
  Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
  window.open = vi.fn();
  fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === "/api/cart") return json(200, []);
    return json(200, {});
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const route = (handlers: Record<string, () => Response>) => {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    for (const [prefix, handler] of Object.entries(handlers)) {
      if (url.startsWith(prefix)) return handler();
    }
    return json(200, []);
  });
};

describe("checkout que falha", () => {
  // The original bug: res.ok was never checked, so any error response fell
  // through to setCart([]) and the customer's cart silently vanished.
  it("mantém o carrinho intacto e mostra o erro quando o servidor recusa", async () => {
    const user = userEvent.setup();
    route({
      "/api/checkout": () => json(409, { error: "Estoque insuficiente para \"Red velvet\"." }),
      "/api/cart": () => json(200, []),
    });
    renderCart();

    await user.click(screen.getByText("add"));
    await user.click(await screen.findByRole("button", { name: "Finalizar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Estoque insuficiente");
    // The cart line item is still there — line total and subtotal both R$ 14,00.
    expect(screen.getByText("Red velvet")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 14,00")).toHaveLength(2);
    expect(screen.queryByText("Seu carrinho está vazio. Que tal uma fatia?")).toBeNull();
  });

  it("usa mensagem genérica quando o servidor não explica o erro", async () => {
    const user = userEvent.setup();
    route({ "/api/checkout": () => json(500, {}), "/api/cart": () => json(200, []) });
    renderCart();

    await user.click(screen.getByText("add"));
    await user.click(await screen.findByRole("button", { name: "Finalizar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível finalizar o pedido");
    expect(screen.getByText("Red velvet")).toBeInTheDocument();
  });
});

describe("checkout que dá certo", () => {
  it("esvazia o carrinho e navega para o Mercado Pago", async () => {
    const user = userEvent.setup();
    route({
      "/api/checkout": () => json(200, { initPoint: "https://mp.example/pay/123" }),
      "/api/cart": () => json(200, []),
    });
    renderCart();

    await user.click(screen.getByText("add"));
    await user.click(await screen.findByRole("button", { name: "Finalizar pedido" }));

    await waitFor(() => expect(window.location.href).toBe("https://mp.example/pay/123"));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("abre o WhatsApp quando o Mercado Pago não está configurado", async () => {
    const user = userEvent.setup();
    route({
      "/api/checkout": () => json(200, { whatsappUrl: "https://wa.me/5587999021574?text=oi" }),
      "/api/cart": () => json(200, []),
    });
    renderCart();

    await user.click(screen.getByText("add"));
    await user.click(await screen.findByRole("button", { name: "Finalizar pedido" }));

    await waitFor(() => expect(window.open).toHaveBeenCalledWith("https://wa.me/5587999021574?text=oi", "_blank"));
    expect(await screen.findByText("Seu carrinho está vazio. Que tal uma fatia?")).toBeInTheDocument();
  });
});

describe("proteção contra pedido duplicado", () => {
  // checkout creates a Mercado Pago preference over the network. Without the
  // in-flight guard a double click books two orders and decrements stock twice.
  it("dois cliques seguidos disparam um único POST /api/checkout", async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const pending = new Promise<void>((r) => (release = r));
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/checkout")) {
        await pending;
        return json(200, { initPoint: "https://mp.example/pay/1" });
      }
      return json(200, []);
    });
    renderCart();

    await user.click(screen.getByText("add"));
    const button = await screen.findByRole("button", { name: "Finalizar pedido" });
    await user.click(button);

    // While in flight the button is disabled and relabelled.
    const sending = await screen.findByRole("button", { name: "Enviando..." });
    expect(sending).toBeDisabled();

    await user.click(sending);
    release();

    await waitFor(() => expect(window.location.href).toBe("https://mp.example/pay/1"));
    const checkoutCalls = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/checkout"));
    expect(checkoutCalls).toHaveLength(1);
  });
});

describe("estoque recusado ao adicionar", () => {
  // The server already answered 409 {error, available}; the UI used to throw
  // that response away and keep showing a quantity the server had refused.
  it("reverte a quantidade otimista para o que o servidor permite", async () => {
    const user = userEvent.setup();
    route({
      "/api/cart": () => json(409, { error: "Estoque insuficiente.", available: 1 }),
    });
    renderCart();

    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("add"));

    expect(await screen.findByRole("status")).toHaveTextContent("Estoque insuficiente.");
    // Two clicks would optimistically be qty 2 (R$ 28,00); the server capped it
    // at 1, so the line and the subtotal must both settle back on R$ 14,00.
    await waitFor(() => expect(screen.queryByText("R$ 28,00")).toBeNull());
    expect(screen.getAllByText("R$ 14,00")).toHaveLength(2);
  });

  it("remove o item quando o servidor diz que não há mais nenhum", async () => {
    const user = userEvent.setup();
    route({
      "/api/cart": () => json(409, { error: "Estoque insuficiente.", available: 0 }),
    });
    renderCart();

    await user.click(screen.getByText("add"));

    expect(await screen.findByText("Seu carrinho está vazio. Que tal uma fatia?")).toBeInTheDocument();
  });
});
