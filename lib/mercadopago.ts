import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

async function getCredentials() {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const accessToken = settings?.mpAccessToken || process.env.MP_ACCESS_TOKEN || null;
  const webhookSecret = settings?.mpWebhookSecret || process.env.MP_WEBHOOK_SECRET || null;
  return { accessToken, webhookSecret };
}

export async function isMercadoPagoConfigured() {
  const { accessToken } = await getCredentials();
  return !!accessToken;
}

export async function getWebhookSecret() {
  const { webhookSecret } = await getCredentials();
  return webhookSecret;
}

async function getMercadoPagoClient() {
  const { accessToken } = await getCredentials();
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken });
}

export async function getPreferenceClient() {
  const mp = await getMercadoPagoClient();
  return mp ? new Preference(mp) : null;
}

export async function getPaymentClient() {
  const mp = await getMercadoPagoClient();
  return mp ? new Payment(mp) : null;
}
