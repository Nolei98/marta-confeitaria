import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenType = "EMAIL_VERIFY" | "PASSWORD_RESET";

export async function createToken(userId: string, type: TokenType, ttlMs: number) {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { userId, type } });
  await prisma.verificationToken.create({
    data: { userId, type, token, expiresAt: new Date(Date.now() + ttlMs) },
  });
  return token;
}

export async function consumeToken(token: string, type: TokenType) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.type !== type || record.expiresAt < new Date()) return null;
  await prisma.verificationToken.delete({ where: { token } });
  return record;
}
