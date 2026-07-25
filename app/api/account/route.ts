import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
  });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { name, phone } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim(), phone: phone?.trim() || null },
    select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
  });
  await logActivity(user.id, "PROFILE_UPDATE");

  return NextResponse.json(user);
}
