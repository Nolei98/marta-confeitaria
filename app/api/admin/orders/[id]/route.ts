import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const VALID_STATUSES: OrderStatus[] = ["PENDENTE", "EM_PREPARO", "PRONTO", "ENTREGUE"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }
  const order = await prisma.order
    .update({ where: { id }, data: { status: status as OrderStatus } })
    .catch(() => null);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json(order);
}
