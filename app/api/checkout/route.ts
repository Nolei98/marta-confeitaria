import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { getPreferenceClient } from "@/lib/mercadopago";
import { getBaseUrl } from "@/lib/baseUrl";
import { isRateLimited, recordAttempt, clientIp } from "@/lib/rateLimit";

const WHATSAPP_NUMBER = "5587998765432";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 15;

type GuestItem = { name: string; price: number; qty: number };

export async function POST(req: Request) {
  const session = await auth();
  const ipKey = `checkout-ip:${clientIp(req)}`;
  if (await isRateLimited(ipKey, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco." }, { status: 429 });
  }
  await recordAttempt(ipKey, WINDOW_MS);

  let items: { name: string; price: number; qty: number }[] = [];
  let userId: string | null = null;
  let guest: { name?: string; email?: string; phone?: string } = {};

  if (session?.user) {
    userId = session.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    const valid = cartItems.filter((i) => i.product);
    items = valid.map((i) => ({ name: i.product.name, price: Number(i.product.price), qty: i.qty }));
  } else {
    const body = await req.json().catch(() => ({}));
    const rawItems = Array.isArray(body?.items) ? (body.items as GuestItem[]) : [];
    items = rawItems
      .filter((i) => i && typeof i.name === "string" && typeof i.price === "number" && typeof i.qty === "number" && i.qty > 0 && i.price > 0)
      .map((i) => ({ name: i.name, price: i.price, qty: i.qty }));
    guest = { name: body?.guestName, email: body?.guestEmail, phone: body?.guestPhone };
  }

  if (!items.length) {
    return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const code = "#" + Math.floor(1000 + Math.random() * 9000);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        code,
        userId,
        guestName: guest.name || null,
        guestEmail: guest.email || null,
        guestPhone: guest.phone || null,
        total,
        items: {
          create: items.map((i) => ({ nameSnapshot: i.name, priceSnapshot: i.price, qty: i.qty })),
        },
      },
      include: { items: true },
    });
    if (userId) await tx.cartItem.deleteMany({ where: { userId } });
    return created;
  });

  if (userId) await logActivity(userId, "CHECKOUT", { orderCode: order.code, total });

  const preferenceClient = await getPreferenceClient();
  if (!preferenceClient) {
    const lines = [
      `Olá! Gostaria de confirmar meu pedido ${order.code}:`,
      ...items.map((i) => `${i.qty}x ${i.name}`),
      `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
    ];
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    return NextResponse.json({ order, whatsappUrl });
  }

  const baseUrl = getBaseUrl(req);
  try {
    const preference = await preferenceClient.create({
      body: {
        items: items.map((i) => ({
          id: i.name,
          title: i.name,
          quantity: i.qty,
          unit_price: i.price,
          currency_id: "BRL",
        })),
        external_reference: order.id,
        back_urls: {
          success: `${baseUrl}/checkout/retorno?status=success&code=${encodeURIComponent(order.code)}`,
          pending: `${baseUrl}/checkout/retorno?status=pending&code=${encodeURIComponent(order.code)}`,
          failure: `${baseUrl}/checkout/retorno?status=failure&code=${encodeURIComponent(order.code)}`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/checkout/webhook`,
        payer: guest.email ? { email: guest.email, name: guest.name } : undefined,
      },
    });

    await prisma.order.update({ where: { id: order.id }, data: { preferenceId: preference.id } });

    return NextResponse.json({ order, initPoint: preference.init_point });
  } catch (err) {
    console.error("[mercadopago] falha ao criar preferência:", err);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 502 });
  }
}
