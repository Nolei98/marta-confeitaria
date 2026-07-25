import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { createToken } from "@/lib/verificationToken";
import { sendEmail, verifyEmailHtml } from "@/lib/email";
import { getBaseUrl } from "@/lib/baseUrl";

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { currentPassword, email, newPassword } = await req.json();
  if (!currentPassword) return NextResponse.json({ error: "Informe sua senha atual." }, { status: 400 });
  if (!email?.trim() && !newPassword) return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  if (newPassword && newPassword.length < 6) return NextResponse.json({ error: "A nova senha precisa ter ao menos 6 caracteres." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });

  const data: { email?: string; passwordHash?: string; emailVerified?: null } = {};
  const emailChanged = email?.trim() && email.trim() !== user.email;

  if (emailChanged) {
    const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (existing) return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
    data.email = email.trim();
    data.emailVerified = null;
  }
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: { id: true, name: true, email: true, phone: true } });
  await logActivity(user.id, "SECURITY_UPDATE");

  if (emailChanged) {
    const token = await createToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS);
    const link = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
    await sendEmail(updated.email, "Confirme seu novo e-mail — Marta Confeitaria", verifyEmailHtml(updated.name, link)).catch((err) => console.error("[email] falha ao enviar confirmação:", err));
  }

  return NextResponse.json({ ...updated, emailChanged });
}
