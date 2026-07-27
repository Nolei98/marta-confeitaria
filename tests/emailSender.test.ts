import { describe, it, expect, afterEach } from "vitest";
import { emailSenderWarning } from "@/lib/email";

const original = process.env.RESEND_FROM_EMAIL;
afterEach(() => {
  if (original === undefined) delete process.env.RESEND_FROM_EMAIL;
  else process.env.RESEND_FROM_EMAIL = original;
});

// Enviar pelo domínio de teste do Resend não gera erro: a API aceita e
// simplesmente não entrega a ninguém além do dono da conta. Era a pior forma de
// falhar — cliente se cadastra, nunca recebe, e nada indica o problema.
describe("aviso do remetente de e-mail", () => {
  it("avisa quando RESEND_FROM_EMAIL não está definida", () => {
    delete process.env.RESEND_FROM_EMAIL;
    const aviso = emailSenderWarning();
    expect(aviso).toBeTruthy();
    expect(aviso).toContain("onboarding@resend.dev");
    expect(aviso).toMatch(/não chegam/i);
  });

  it("fica calado quando há remetente próprio configurado", () => {
    process.env.RESEND_FROM_EMAIL = "Marta <contato@martaconfeitaria.com.br>";
    expect(emailSenderWarning()).toBeNull();
  });
});
