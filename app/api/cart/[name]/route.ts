import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function PATCH(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { name } = await params;
  const { qty } = await req.json();
  const product = await prisma.product.findFirst({ where: { name: decodeURIComponent(name) } });
  if (!product) return NextResponse.json({ removed: true });

  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id, productId: product.id } });
    return NextResponse.json({ removed: true });
  }

  const item = await prisma.cartItem
    .update({ where: { userId_productId: { userId: session.user.id, productId: product.id } }, data: { qty } })
    .catch(() => null);

  // Item may already be gone (e.g. product deleted between page load and this request).
  if (!item) return NextResponse.json({ removed: true });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { name } = await params;
  const product = await prisma.product.findFirst({ where: { name: decodeURIComponent(name) } });
  if (!product) return NextResponse.json({ removed: true });

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id, productId: product.id } });
  await logActivity(session.user.id, "REMOVE_FROM_CART", { productId: product.id, name: product.name });

  return NextResponse.json({ removed: true });
}
