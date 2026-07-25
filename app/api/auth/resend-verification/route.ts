import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/verificationToken";
import { sendEmail, verifyEmailHtml } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";
import { isRateLimited, recordAttempt } from "@/lib/rateLimit";

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const key = `resend-verify:${user.id}`;
  if (await isRateLimited(key, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Aguarde um pouco antes de pedir outro e-mail." }, { status: 429 });
  }
  await recordAttempt(key, WINDOW_MS);

  const token = await createToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS);
  const link = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
  await sendEmail(user.email, "Confirme seu e-mail — Marta Confeitaria", verifyEmailHtml(user.name, link)).catch((err) => console.error("[email] falha ao reenviar confirmação:", err));

  return NextResponse.json({ ok: true });
}
