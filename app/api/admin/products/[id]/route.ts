import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  const data = await req.json();
  const product = await prisma.product
    .update({ where: { id }, data })
    .catch(() => null);
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  // CartItem rows cascade-delete (customers just lose the item from their cart,
  // no error). OrderItem rows keep their name/price snapshot and only lose the
  // product reference (SetNull), so past order history stays intact.
  await prisma.product.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
