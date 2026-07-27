import { describe, it, expect } from "vitest";
import { getBaseUrl } from "@/lib/baseUrl";

const reqWith = (headers: Record<string, string>) => new Request("http://x/api", { headers });

// getBaseUrl builds the back_urls handed to Mercado Pago. Get the scheme wrong
// and the customer returns from checkout to a broken link.
describe("getBaseUrl", () => {
  it("usa https por padrão em host de produção", () => {
    expect(getBaseUrl(reqWith({ host: "marta.com.br" }))).toBe("https://marta.com.br");
  });

  it("usa http em localhost", () => {
    expect(getBaseUrl(reqWith({ host: "localhost:2888" }))).toBe("http://localhost:2888");
  });

  it("respeita x-forwarded-proto do proxy", () => {
    expect(getBaseUrl(reqWith({ host: "localhost:2888", "x-forwarded-proto": "https" }))).toBe("https://localhost:2888");
  });

  it("cai pro host local quando o header host não vem", () => {
    expect(getBaseUrl(new Request("http://x/api"))).toMatch(/^https?:\/\/localhost:2888$/);
  });
});
