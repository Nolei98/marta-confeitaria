import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json({ error: "Dados inválidos. A senha precisa ter ao menos 6 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });
  await logActivity(user.id, "REGISTER");

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
