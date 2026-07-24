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
      name: i.product.name,
      price: Number(i.product.price),
      qty: i.qty,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { name, qty = 1 } = await req.json();
  const product = await prisma.product.findFirst({ where: { name, active: true } });
  if (!product) {
    return NextResponse.json({ error: "Produto indisponível." }, { status: 404 });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId: product.id } },
    update: { qty: { increment: qty } },
    create: { userId: session.user.id, productId: product.id, qty },
  });
  await logActivity(session.user.id, "ADD_TO_CART", { productId: product.id, name: product.name, qty });

  return NextResponse.json(item);
}
