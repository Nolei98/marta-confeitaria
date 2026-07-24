import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

const WHATSAPP_NUMBER = "5587998765432";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });
  const valid = cartItems.filter((i) => i.product);
  if (!valid.length) {
    return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
  }

  const total = valid.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0);
  const code = "#" + Math.floor(1000 + Math.random() * 9000);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        code,
        userId: session.user.id,
        total,
        items: {
          create: valid.map((i) => ({
            productId: i.productId,
            nameSnapshot: i.product.name,
            priceSnapshot: i.product.price,
            qty: i.qty,
          })),
        },
      },
      include: { items: true },
    });
    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
    return created;
  });

  await logActivity(session.user.id, "CHECKOUT", { orderCode: order.code, total });

  const lines = [
    `Olá! Gostaria de confirmar meu pedido ${order.code}:`,
    ...valid.map((i) => `${i.qty}x ${i.product.name}`),
    `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
  ];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;

  return NextResponse.json({ order, whatsappUrl });
}
