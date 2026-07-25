import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let client: MercadoPagoConfig | null = null;

export function getMercadoPagoClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;
  if (!client) client = new MercadoPagoConfig({ accessToken });
  return client;
}

export function getPreferenceClient() {
  const mp = getMercadoPagoClient();
  return mp ? new Preference(mp) : null;
}

export function getPaymentClient() {
  const mp = getMercadoPagoClient();
  return mp ? new Payment(mp) : null;
}

export function isMercadoPagoConfigured() {
  return !!process.env.MP_ACCESS_TOKEN;
}
