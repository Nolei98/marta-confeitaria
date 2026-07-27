import { describe, it, expect } from "vitest";
import { WHATSAPP_NUMBER, WHATSAPP_URL, WHATSAPP_DISPLAY, WHATSAPP_E164, whatsappLink } from "@/lib/contact";

// A wrong number here silently routes every customer contact into the void,
// and nothing else in the app would fail loudly — so pin the shape.
describe("contato do WhatsApp", () => {
  it("usa o número da loja em E.164 sem separadores", () => {
    expect(WHATSAPP_NUMBER).toBe("5587999021574");
  });

  it("mantém display e E.164 apontando pro mesmo número do link", () => {
    const digitsOf = (s: string) => s.replace(/\D/g, "");
    expect(digitsOf(WHATSAPP_E164)).toBe(WHATSAPP_NUMBER);
    expect(digitsOf(WHATSAPP_DISPLAY)).toBe(WHATSAPP_NUMBER.slice(2));
  });

  it("monta a URL base do wa.me", () => {
    expect(WHATSAPP_URL).toBe("https://wa.me/5587999021574");
  });

  it("codifica quebras de linha e acentos na mensagem", () => {
    const link = whatsappLink("Olá!\n2x Bolo");
    expect(link).toBe("https://wa.me/5587999021574?text=Ol%C3%A1!%0A2x%20Bolo");
    expect(link).not.toContain("\n");
  });

  it("não quebra com mensagem vazia", () => {
    expect(whatsappLink("")).toBe("https://wa.me/5587999021574?text=");
  });
});
