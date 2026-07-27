// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/cardapio",
  useSearchParams: () => new URLSearchParams(),
}));
// The catalogue is what's under test; the chrome around it is not.
vi.mock("@/components/layout/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("@/components/layout/Footer", () => ({ Footer: () => null }));

import CardapioPage from "@/app/cardapio/page";
import { CartProvider } from "@/components/cart/CartContext";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const product = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "p1",
  name: "Bolo de fubá da vovó",
  category: "Fatia",
  price: 11,
  imageUrl: null,
  stock: null,
  ...over,
});

const renderPage = () =>
  render(
    <CartProvider>
      <CardapioPage />
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

describe("catálogo quando a API falha", () => {
  // The page used to swallow the error and render a hardcoded catalogue of nine
  // invented slices, indistinguishable from real stock. Every one of them led to
  // an order the server could not honour.
  const GHOST_NAMES = ["Chocolate intenso", "Red velvet", "Prestígio", "Floresta negra", "Fubá cremoso"];

  it("não inventa produtos quando a resposta é 500", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(500, { error: "boom" })));
    renderPage();

    expect(await screen.findByText(/Não conseguimos carregar o cardápio/)).toBeInTheDocument();
    for (const name of GHOST_NAMES) {
      expect(screen.queryByText(name)).toBeNull();
    }
  });

  it("não inventa produtos quando a rede cai", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    renderPage();

    expect(await screen.findByText(/Não conseguimos carregar o cardápio/)).toBeInTheDocument();
    for (const name of GHOST_NAMES) {
      expect(screen.queryByText(name)).toBeNull();
    }
  });

  it("oferece tentar de novo, e a segunda tentativa carrega o catálogo real", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => json(500, {}))
      .mockImplementation(async () => json(200, [product()]));
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Tentar de novo" }));

    expect(await screen.findByText("Bolo de fubá da vovó")).toBeInTheDocument();
    expect(screen.queryByText(/Não conseguimos carregar o cardápio/)).toBeNull();
  });
});

describe("catálogo vazio", () => {
  // An empty grid used to render as a blank white rectangle with no explanation.
  it("explica que não há fatia em vez de mostrar uma área em branco", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(200, [])));
    renderPage();

    expect(await screen.findByText(/Nenhuma fatia disponível no momento/)).toBeInTheDocument();
  });

  it("explica que não há bolo cadastrado na aba de bolos", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => json(200, [product()])));
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Bolos inteiros" }));

    expect(await screen.findByText(/Nenhum modelo de bolo cadastrado/)).toBeInTheDocument();
  });
});

describe("estoque no catálogo", () => {
  it("marca como esgotado e desabilita o botão quando stock é 0", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(200, [product({ stock: 0 })])));
    renderPage();

    expect(await screen.findByText("Esgotado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Esgotado" })).toBeDisabled();
  });

  it("deixa comprar quando stock é null (estoque não controlado)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(200, [product({ stock: null })])));
    renderPage();

    expect(await screen.findByRole("button", { name: "Adicionar ao carrinho" })).toBeEnabled();
    expect(screen.queryByText("Esgotado")).toBeNull();
  });

  it("deixa comprar quando ainda há uma unidade", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(200, [product({ stock: 1 })])));
    renderPage();

    expect(await screen.findByRole("button", { name: "Adicionar ao carrinho" })).toBeEnabled();
  });
});
