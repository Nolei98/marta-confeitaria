import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { isRateLimited, recordAttempt, clientIp } from "@/lib/rateLimit";
import { createToken } from "@/lib/verificationToken";
import { sendEmail, verifyEmailHtml } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_MAX_ATTEMPTS = 8;

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json({ error: "Dados inválidos. A senha precisa ter ao menos 6 caracteres." }, { status: 400 });
  }

  const ipKey = `register-ip:${clientIp(req)}`;
  if (await isRateLimited(ipKey, REGISTER_MAX_ATTEMPTS, REGISTER_WINDOW_MS)) {
    return NextResponse.json({ error: "Muitas tentativas de cadastro. Tente novamente mais tarde." }, { status: 429 });
  }
  await recordAttempt(ipKey, REGISTER_WINDOW_MS);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });
  await logActivity(user.id, "REGISTER");

  const token = await createToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS);
  const link = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
  await sendEmail(user.email, "Confirme seu e-mail — Marta Confeitaria", verifyEmailHtml(user.name, link)).catch((err) => console.error("[email] falha ao enviar confirmação:", err));

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
