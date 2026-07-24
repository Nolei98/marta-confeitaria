import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/verificationToken";
import { sendEmail, resetPasswordHtml } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";
import { isRateLimited, recordAttempt, clientIp } from "@/lib/rateLimit";

const RESET_TTL_MS = 60 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });

  const ipKey = `forgot-password-ip:${clientIp(req)}`;
  const emailKey = `forgot-password:${String(email).toLowerCase()}`;
  if ((await isRateLimited(ipKey, MAX_ATTEMPTS * 3, WINDOW_MS)) || (await isRateLimited(emailKey, MAX_ATTEMPTS, WINDOW_MS))) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }
  await recordAttempt(ipKey, WINDOW_MS);
  await recordAttempt(emailKey, WINDOW_MS);

  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond with success, whether or not the account exists, so this endpoint can't be used to enumerate registered emails.
  if (user) {
    const token = await createToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
    const link = `${getBaseUrl(req)}/redefinir-senha?token=${token}`;
    await sendEmail(user.email, "Redefinir senha — Marta Confeitaria", resetPasswordHtml(user.name, link)).catch((err) => console.error("[email] falha ao enviar redefinição:", err));
  }

  return NextResponse.json({ ok: true });
}
