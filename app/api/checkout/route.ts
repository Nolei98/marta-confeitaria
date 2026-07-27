import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { getPreferenceClient } from "@/lib/mercadopago";
import { getBaseUrl } from "@/lib/baseUrl";
import { isRateLimited, recordAttempt, clientIp } from "@/lib/rateLimit";
import { whatsappLink } from "@/lib/contact";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 15;

type GuestItem = { name: string; qty: number };
type ResolvedItem = { productId: string; name: string; price: number; qty: number; stock: number | null };

const MAX_ITEM_LINES = 40;
const MAX_QTY_PER_ITEM = 99;
const MAX_TEXT_LEN = 120;

function sanitizeText(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed || null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const session = await auth();
  const ipKey = `checkout-ip:${clientIp(req)}`;
  if (await isRateLimited(ipKey, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco." }, { status: 429 });
  }
  await recordAttempt(ipKey, WINDOW_MS);

  let items: ResolvedItem[] = [];
  let userId: string | null = null;
  let guest: { name?: string; email?: string; phone?: string } = {};

  if (session?.user) {
    userId = session.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    const valid = cartItems.filter((i) => i.product);
    items = valid.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: Number(i.product.price),
      qty: i.qty,
      stock: i.product.stock,
    }));
  } else {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
    }
    const rawItems = Array.isArray(body.items) ? (body.items as unknown[]) : [];
    if (rawItems.length > MAX_ITEM_LINES) {
      return NextResponse.json({ error: "Carrinho tem itens demais." }, { status: 400 });
    }
    // Só nome e quantidade vêm do cliente (e são revalidados abaixo). Preço e
    // existência do produto sempre vêm do banco — nunca do cliente — pra não
    // permitir pedido com preço adulterado, produto inventado ou qty absurda.
    const requested = rawItems
      .map((i) => i as Partial<GuestItem>)
      .filter(
        (i) =>
          i &&
          typeof i.name === "string" &&
          i.name.trim().length > 0 &&
          i.name.length <= MAX_TEXT_LEN &&
          typeof i.qty === "number" &&
          Number.isInteger(i.qty) &&
          i.qty > 0 &&
          i.qty <= MAX_QTY_PER_ITEM
      );
    if (!requested.length) {
      return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
    }
    for (const r of requested) {
      const product = await prisma.product.findFirst({ where: { name: r.name!.trim(), active: true } });
      if (!product) {
        return NextResponse.json({ error: `Produto "${r.name}" não está mais disponível.` }, { status: 409 });
      }
      items.push({ productId: product.id, name: product.name, price: Number(product.price), qty: r.qty!, stock: product.stock });
    }
    guest = {
      name: sanitizeText(body.guestName, MAX_TEXT_LEN) ?? undefined,
      email: sanitizeText(body.guestEmail, MAX_TEXT_LEN) ?? undefined,
      phone: sanitizeText(body.guestPhone, 30) ?? undefined,
    };
    if (guest.email && !EMAIL_RE.test(guest.email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
  }

  if (!items.length) {
    return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "Não foi possível calcular o total do pedido." }, { status: 400 });
  }
  let order;
  const MAX_CODE_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = "#" + Math.floor(1000 + Math.random() * 9000);
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          if (item.stock === null) continue;
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (result.count === 0) {
            throw new Error(`STOCK:${item.name}`);
          }
        }

        const created = await tx.order.create({
          data: {
            code,
            userId,
            guestName: guest.name || null,
            guestEmail: guest.email || null,
            guestPhone: guest.phone || null,
            total,
            items: {
              create: items.map((i) => ({ productId: i.productId, nameSnapshot: i.name, priceSnapshot: i.price, qty: i.qty })),
            },
          },
          include: { items: true },
        });
        if (userId) await tx.cartItem.deleteMany({ where: { userId } });
        return created;
      });
      break;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("STOCK:")) {
        return NextResponse.json({ error: `Estoque insuficiente para "${err.message.slice(6)}".` }, { status: 409 });
      }
      const isCodeCollision = typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
      if (isCodeCollision && attempt < MAX_CODE_ATTEMPTS) {
        continue;
      }
      console.error("[checkout] falha ao criar pedido:", err);
      return NextResponse.json({ error: "Não foi possível criar o pedido. Tente novamente." }, { status: 500 });
    }
  }
  if (!order) {
    return NextResponse.json({ error: "Não foi possível criar o pedido. Tente novamente." }, { status: 500 });
  }

  if (userId) await logActivity(userId, "CHECKOUT", { orderCode: order.code, total });

  const preferenceClient = await getPreferenceClient();
  if (!preferenceClient) {
    const lines = [
      `Olá! Gostaria de confirmar meu pedido ${order.code}:`,
      ...items.map((i) => `${i.qty}x ${i.name}`),
      `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
    ];
    const whatsappUrl = whatsappLink(lines.join("\n"));
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
