import { SimpleHeader } from "@/components/layout/SimpleHeader";
import { Footer } from "@/components/layout/Footer";

export default function TermosPage() {
  return (
    <>
      <SimpleHeader />

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: "#c1531c", marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, margin: "0 0 8px" }}>Termos de Uso</h1>
        <p style={{ color: "#8b7d76", fontSize: 14, margin: "0 0 32px" }}>Última atualização: julho de 2026</p>

        <div style={{ color: "#4a3934", fontSize: 15, lineHeight: 1.8 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>1. Sobre este site</h2>
          <p>Este site é operado pela Marta Confeitaria, para divulgação e venda de fatias e bolos artesanais, localizada em Salgueiro - PE. Ao navegar ou fazer pedidos, você concorda com estes Termos de Uso.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>2. Pedidos</h2>
          <p>Os pedidos feitos pelo site são finalizados via WhatsApp. A confirmação, forma de pagamento e prazo de entrega são combinados diretamente com nossa equipe. Preços e disponibilidade podem mudar sem aviso prévio.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>3. Conta de usuário</h2>
          <p>Criar uma conta é opcional e não é necessário para comprar. Usuários com conta podem acessar histórico de pedidos, participar de promoções exclusivas e receber notificações por e-mail. Você é responsável por manter sua senha em sigilo.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>4. Conteúdo do site</h2>
          <p>Imagens, textos e identidade visual pertencem à Marta Confeitaria e não podem ser reproduzidos sem autorização.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>5. Alterações</h2>
          <p>Podemos atualizar estes termos a qualquer momento. Recomendamos revisar esta página periodicamente.</p>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3f2a26", margin: "28px 0 10px" }}>6. Contato</h2>
          <p>Dúvidas sobre estes termos podem ser enviadas para contato@martaconfeitaria.com.br ou pelo WhatsApp (11) 96789-1234.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
