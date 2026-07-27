// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Marta" } }, status: "authenticated" }),
}));

import { CartProvider, useCart } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function Harness() {
  const { addToCart } = useCart();
  return (
    <>
      <button onClick={() => addToCart("prod-rv", "Red velvet", 14)}>abrir carrinho</button>
      <button>outro botão da página</button>
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

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => json(200, [])));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// O carrinho cobre a página inteira. Sem tratamento de diálogo, quem usa
// teclado continua tabulando no catálogo atrás do overlay sem perceber.
describe("carrinho como diálogo acessível", () => {
  it("se anuncia como diálogo modal", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("abrir carrinho"));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Seu carrinho");
  });

  it("fecha com Escape", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("abrir carrinho"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("move o foco para dentro ao abrir", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("abrir carrinho"));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it("devolve o foco ao botão que o abriu", async () => {
    const user = userEvent.setup();
    renderCart();
    const opener = screen.getByText("abrir carrinho");
    opener.focus();
    await user.click(opener);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it("prende o Tab dentro do carrinho", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("abrir carrinho"));
    const dialog = await screen.findByRole("dialog");

    // Tabula bem mais vezes do que há controles: sem trava, o foco escaparia
    // para os botões da página que ficam atrás do overlay.
    for (let i = 0; i < 12; i++) await user.tab();

    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("dá nome acessível aos controles de cada item", async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText("abrir carrinho"));

    expect(await screen.findByRole("button", { name: "Aumentar quantidade de Red velvet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diminuir quantidade de Red velvet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover Red velvet do carrinho" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar carrinho" })).toBeInTheDocument();
  });
});
