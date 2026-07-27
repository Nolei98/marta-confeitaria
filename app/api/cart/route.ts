import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { addedAt: "asc" },
  });

  // A product may have been deleted after being added to the cart: drop those
  // items silently instead of erroring, so the customer's cart just shrinks.
  const valid = items.filter((i) => i.product);
  const orphanIds = items.filter((i) => !i.product).map((i) => i.id);
  if (orphanIds.length) {
    await prisma.cartItem.deleteMany({ where: { id: { in: orphanIds } } });
  }

  return NextResponse.json(
    valid.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: Number(i.product.price),
      qty: i.qty,
    }))
  );
}

const MAX_QTY = 99;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  const qty = body?.qty === undefined ? 1 : body.qty;
  if (!productId) {
    return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
  }
  if (typeof qty !== "number" || !Number.isInteger(qty) || qty <= 0 || qty > MAX_QTY) {
    return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({ where: { id: productId, active: true } });
  if (!product) {
    return NextResponse.json({ error: "Produto indisponível." }, { status: 404 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId: product.id } },
  });
  const nextQty = (existing?.qty ?? 0) + qty;
  if (nextQty > MAX_QTY) {
    return NextResponse.json({ error: "Quantidade máxima por item excedida." }, { status: 400 });
  }
  if (product.stock !== null && nextQty > product.stock) {
    return NextResponse.json({ error: "Estoque insuficiente.", available: product.stock }, { status: 409 });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId: product.id } },
    update: { qty: { increment: qty } },
    create: { userId: session.user.id, productId: product.id, qty },
  });
  await logActivity(session.user.id, "ADD_TO_CART", { productId: product.id, name: product.name, qty });

  return NextResponse.json(item);
}
