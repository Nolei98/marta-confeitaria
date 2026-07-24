import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/verificationToken";
import { logActivity } from "@/lib/activityLog";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: "Dados inválidos. A senha precisa ter ao menos 6 caracteres." }, { status: 400 });
  }

  const record = await consumeToken(token, "PASSWORD_RESET");
  if (!record) return NextResponse.json({ error: "Link inválido ou expirado. Solicite uma nova redefinição." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await logActivity(record.userId, "PASSWORD_RESET");

  return NextResponse.json({ ok: true });
}
