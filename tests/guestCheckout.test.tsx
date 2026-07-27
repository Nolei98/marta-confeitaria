// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Visitante: sem conta, o carrinho vive só no navegador.
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

import { CartProvider, useCart } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

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

const checkoutBody = () => {
  const call = fetchMock.mock.calls.find(([u]) => String(u).startsWith("/api/checkout"));
  return call ? JSON.parse(call[1].body) : null;
};

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
  window.open = vi.fn();
  fetchMock = vi.fn(async () => json(200, { initPoint: "https://mp.example/pay/1" }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// Sem esses dados o pedido chega impossível de atender: a confeitaria não sabe
// quem comprou nem tem como avisar que ficou pronto.
describe("contato do visitante no carrinho", () => {
  it("pede nome e WhatsApp quando não há login", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("add"));

    expect(await screen.findByLabelText("Seu nome")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp")).toBeInTheDocument();
  });

  it("não envia o pedido sem nome", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("add"));
    await user.type(await screen.findByLabelText("WhatsApp"), "87999999999");
    await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Informe seu nome");
    expect(checkoutBody()).toBeNull();
  });

  it("não envia o pedido sem WhatsApp válido", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("add"));
    await user.type(await screen.findByLabelText("Seu nome"), "Ana Paula");
    await user.type(screen.getByLabelText("WhatsApp"), "999");
    await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("WhatsApp com DDD");
    expect(checkoutBody()).toBeNull();
  });

  it("envia nome e telefone junto com os itens", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("add"));
    await user.type(await screen.findByLabelText("Seu nome"), "Ana Paula");
    await user.type(screen.getByLabelText("WhatsApp"), "(87) 99999-9999");
    await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

    await waitFor(() => expect(checkoutBody()).not.toBeNull());
    const body = checkoutBody();
    expect(body.guestName).toBe("Ana Paula");
    expect(body.guestPhone).toBe("(87) 99999-9999");
    expect(body.items).toEqual([{ name: "Red velvet", price: 14, qty: 1 }]);
  });

  it("aceita telefone escrito só com dígitos", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("add"));
    await user.type(await screen.findByLabelText("Seu nome"), "Ana");
    await user.type(screen.getByLabelText("WhatsApp"), "8799999999");
    await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

    await waitFor(() => expect(checkoutBody()).not.toBeNull());
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("mantém o erro de contato separado do erro do servidor", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async () => json(409, { error: "Estoque insuficiente." }));
    renderCart();
    await user.click(screen.getByText("add"));
    await user.type(await screen.findByLabelText("Seu nome"), "Ana");
    await user.type(screen.getByLabelText("WhatsApp"), "87999999999");
    await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

    // O carrinho segue montado e a mensagem é a do servidor, não a de contato.
    expect(await screen.findByText("Estoque insuficiente.")).toBeInTheDocument();
    expect(screen.getByText("Red velvet")).toBeInTheDocument();
  });
});
