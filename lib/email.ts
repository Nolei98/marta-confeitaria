import { Resend } from "resend";

/** Domínio de teste do Resend: entrega só para o dono da conta. */
const SANDBOX_FROM = "Marta Confeitaria <onboarding@resend.dev>";

const FROM = process.env.RESEND_FROM_EMAIL || SANDBOX_FROM;

/**
 * Enviar com o remetente de sandbox não dá erro — o Resend aceita a chamada e
 * simplesmente não entrega a ninguém além do dono da conta. Era a pior forma de
 * falhar: cliente cadastra, nunca recebe a confirmação, e nada no log indica
 * que algo deu errado. Este aviso existe para essa configuração não passar
 * despercebida em produção.
 */
export function emailSenderWarning(): string | null {
  if (process.env.RESEND_FROM_EMAIL) return null;
  return (
    "RESEND_FROM_EMAIL não está configurada, então os e-mails saem de " +
    "onboarding@resend.dev — domínio de teste que só entrega para o dono da " +
    "conta Resend. Confirmação de cadastro e redefinição de senha NÃO chegam " +
    "aos clientes. Verifique um domínio no Resend e defina RESEND_FROM_EMAIL."
  );
}

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY não configurada — e-mail não enviado.\nPara: ${to}\nAssunto: ${subject}\n${html}`);
    return;
  }

  const warning = emailSenderWarning();
  if (warning) console.error(`[email] ATENÇÃO: ${warning}`);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export function verifyEmailHtml(name: string, link: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#c1531c">Olá, ${name}!</h2>
    <p>Confirme seu e-mail pra ativar sua conta na Marta Confeitaria:</p>
    <p><a href="${link}" style="background:#c1531c;color:#fff;padding:12px 22px;border-radius:30px;text-decoration:none;display:inline-block">Confirmar e-mail</a></p>
    <p style="color:#8b7d76;font-size:13px">Se não foi você, ignore esta mensagem.</p>
  </div>`;
}

export function resetPasswordHtml(name: string, link: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#c1531c">Olá, ${name}!</h2>
    <p>Recebemos um pedido pra redefinir sua senha na Marta Confeitaria. O link abaixo vale por 1 hora:</p>
    <p><a href="${link}" style="background:#c1531c;color:#fff;padding:12px 22px;border-radius:30px;text-decoration:none;display:inline-block">Redefinir senha</a></p>
    <p style="color:#8b7d76;font-size:13px">Se não foi você, ignore esta mensagem — sua senha continua a mesma.</p>
  </div>`;
}
