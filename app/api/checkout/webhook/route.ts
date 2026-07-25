import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { getPaymentClient, getWebhookSecret } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

const STATUS_MAP: Record<string, "PENDING" | "IN_PROCESS" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED"> = {
  pending: "PENDING",
  in_process: "IN_PROCESS",
  approved: "APPROVED",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
  charged_back: "REFUNDED",
};

async function handle(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => null);

  const dataId = url.searchParams.get("data.id") || body?.data?.id || url.searchParams.get("id");
  const type = url.searchParams.get("type") || body?.type || url.searchParams.get("topic");

  // Only payment notifications carry a status we care about — everything else
  // (merchant_order, etc.) is acknowledged and ignored.
  if (type !== "payment" || !dataId) {
    return NextResponse.json({ ok: true });
  }

  const secret = await getWebhookSecret();
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: req.headers.get("x-signature"),
        xRequestId: req.headers.get("x-request-id"),
        dataId: url.searchParams.get("data.id"),
        secret,
      });
    } catch (err) {
      console.error("[mercadopago webhook] assinatura inválida:", err);
      return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
    }
  }

  const paymentClient = await getPaymentClient();
  if (!paymentClient) return NextResponse.json({ ok: true });

  const payment = await paymentClient.get({ id: dataId }).catch((err) => {
    console.error("[mercadopago webhook] falha ao buscar pagamento:", err);
    return null;
  });
  if (!payment?.external_reference) return NextResponse.json({ ok: true });

  const order = await prisma.order.findUnique({ where: { id: payment.external_reference } });
  if (!order) return NextResponse.json({ ok: true });

  const paymentStatus = STATUS_MAP[payment.status ?? ""] ?? "PENDING";
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus, paymentId: String(payment.id) },
  });

  if (paymentStatus === "APPROVED" && order.userId) {
    await logActivity(order.userId, "PAYMENT_APPROVED", { orderCode: order.code });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
