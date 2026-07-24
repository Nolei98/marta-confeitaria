import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  const { role } = await req.json();

  if (id === session.user.id && role !== "ADMIN") {
    return NextResponse.json({ error: "Você não pode remover seu próprio acesso de admin." }, { status: 400 });
  }
  if (!["CUSTOMER", "PARTNER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const user = await prisma.user
    .update({ where: { id }, data: { role }, select: { id: true, name: true, email: true, role: true } })
    .catch(() => null);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta por aqui." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
