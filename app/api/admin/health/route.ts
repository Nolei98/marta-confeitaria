import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { emailSenderWarning } from "@/lib/email";
import { getPreferenceClient } from "@/lib/mercadopago";

/**
 * Problemas de configuração que não geram erro em lugar nenhum — a loja segue
 * funcionando e ninguém percebe que algo está pela metade. Reunidos aqui para
 * o painel poder mostrá-los.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const warnings: { key: string; title: string; detail: string }[] = [];

  const emailWarning = emailSenderWarning();
  if (emailWarning) {
    warnings.push({
      key: "email",
      title: "E-mails não chegam aos clientes",
      detail: emailWarning,
    });
  }

  if (!process.env.RESEND_API_KEY) {
    warnings.push({
      key: "email-key",
      title: "Envio de e-mail desligado",
      detail:
        "RESEND_API_KEY não está configurada. Nenhum e-mail é enviado — nem confirmação de cadastro, nem redefinição de senha.",
    });
  }

  if (!(await getPreferenceClient())) {
    warnings.push({
      key: "pagamento",
      title: "Pagamento pelo site desativado",
      detail:
        "Nenhuma chave do Mercado Pago configurada. Todo checkout está sendo fechado pelo WhatsApp e nenhuma cobrança automática acontece. Configure na aba Pagamentos.",
    });
  }

  return NextResponse.json({ warnings });
}
