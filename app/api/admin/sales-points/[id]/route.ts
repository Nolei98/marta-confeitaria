import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  const { name, address, lat, lng } = await req.json();

  const point = await prisma.salesPoint
    .update({ where: { id }, data: { name, address, lat, lng } })
    .catch(() => null);
  if (!point) return NextResponse.json({ error: "Ponto não encontrado." }, { status: 404 });
  return NextResponse.json(point);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  await prisma.salesPoint.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
