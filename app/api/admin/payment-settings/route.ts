import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

function mask(value: string | null | undefined) {
  if (!value) return null;
  return value.length <= 4 ? "••••" : `••••••••${value.slice(-4)}`;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    accessTokenMasked: mask(settings?.mpAccessToken),
    webhookSecretMasked: mask(settings?.mpWebhookSecret),
    updatedAt: settings?.updatedAt ?? null,
  });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { mpAccessToken, mpWebhookSecret } = await req.json();
  const data: { mpAccessToken?: string | null; mpWebhookSecret?: string | null } = {};
  if (mpAccessToken !== undefined) data.mpAccessToken = mpAccessToken?.trim() || null;
  if (mpWebhookSecret !== undefined) data.mpWebhookSecret = mpWebhookSecret?.trim() || null;

  const settings = await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({
    accessTokenMasked: mask(settings.mpAccessToken),
    webhookSecretMasked: mask(settings.mpWebhookSecret),
    updatedAt: settings.updatedAt,
  });
}
