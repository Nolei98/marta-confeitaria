import { SimpleHeader } from "@/components/layout/SimpleHeader";
import { Footer } from "@/components/layout/Footer";
import { WHATSAPP_DISPLAY } from "@/lib/contact";

export default function PrivacidadePage() {
  return (
    <>
      <SimpleHeader />

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#c1531c", marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, margin: "0 0 8px" }}>Política de Privacidade</h1>
        <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 32px" }}>Última atualização: julho de 2026</p>

        <div style={{ color: "#4a3934", fontSize: 15, lineHeight: 1.8 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>1. Quais dados coletamos</h2>
          <p>Coletamos apenas os dados que você nos fornece: nome, e-mail, telefone e endereço, ao criar uma conta, fazer um pedido ou entrar em contato conosco.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>2. Como usamos seus dados</h2>
          <p>Usamos seus dados para processar pedidos, manter seu histórico de compras, enviar notificações sobre promoções (quando você optar por isso) e melhorar nosso atendimento. Não vendemos seus dados a terceiros.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>3. Conta opcional</h2>
          <p>Você pode navegar e comprar sem criar conta. A conta é usada apenas para quem deseja histórico de pedidos, participação em promoções e notificações por e-mail.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>4. Armazenamento</h2>
          <p>Seus dados são armazenados de forma segura e mantidos apenas pelo tempo necessário para as finalidades descritas nesta política.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>5. Seus direitos</h2>
          <p>Você pode solicitar a qualquer momento a correção ou exclusão dos seus dados, ou cancelar notificações por e-mail, entrando em contato conosco.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>6. Contato</h2>
          <p>Para dúvidas sobre esta política, fale conosco em contato@martaconfeitaria.com.br ou pelo WhatsApp {WHATSAPP_DISPLAY}.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
