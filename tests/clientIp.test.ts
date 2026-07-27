import { describe, it, expect, vi } from "vitest";

// clientIp lives next to the DB-backed rate limiter; stub Prisma so this stays
// a pure unit test with no database.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

const { clientIp } = await import("@/lib/rateLimit");

const reqWith = (headers: Record<string, string>) => new Request("http://x/api", { headers });

// clientIp is the rate-limit bucket key. If it collapses to one value for every
// caller, a single attacker locks out the whole site.
describe("clientIp", () => {
  it("pega o primeiro IP do x-forwarded-for", () => {
    expect(clientIp(reqWith({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" }))).toBe("203.0.113.7");
  });

  it("remove espaços em volta do IP", () => {
    expect(clientIp(reqWith({ "x-forwarded-for": "  203.0.113.7  " }))).toBe("203.0.113.7");
  });

  it("prefere x-forwarded-for sobre x-real-ip", () => {
    expect(clientIp(reqWith({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "198.51.100.1" }))).toBe("203.0.113.7");
  });

  it("cai pro x-real-ip quando não há x-forwarded-for", () => {
    expect(clientIp(reqWith({ "x-real-ip": "198.51.100.1" }))).toBe("198.51.100.1");
  });

  it("retorna 'unknown' sem nenhum header de IP", () => {
    expect(clientIp(new Request("http://x/api"))).toBe("unknown");
  });
});
