import { prisma } from "@/lib/prisma";

export async function isRateLimited(identifier: string, maxAttempts: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.loginAttempt.count({ where: { identifier, createdAt: { gte: since } } });
  return count >= maxAttempts;
}

export async function recordAttempt(identifier: string, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  await prisma.$transaction([
    prisma.loginAttempt.create({ data: { identifier } }),
    prisma.loginAttempt.deleteMany({ where: { identifier, createdAt: { lt: since } } }),
  ]);
}

export async function clearAttempts(identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
