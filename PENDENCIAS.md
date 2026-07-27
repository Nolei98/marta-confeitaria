# O que falta para a loja vender de verdade

Levantado em 27/07/2026, direto do banco de produção e do código.

**A parte técnica está pronta.** A loja está no ar, o fluxo de compra funciona, os testes passam e o deploy é automático. O que falta abaixo é **configuração e conteúdo** — quase nada exige programação.

**Exceção importante:** os itens **8** (entrega) e **9** (contato do visitante) exigem programação e uma decisão de negócio da cliente. São bloqueadores de verdade — não dá para ativar o pagamento pelo site sem eles.

Ordem sugerida: 1 → 2 → **8 e 9** → 3 → 4, depois o resto.

---

## 1. Limpar os dados de demonstração

**Situação:** o banco de produção tem **87 pedidos** e **23 usuários falsos**, gerados pelo `db:seed-demo`. O dashboard mostra **R$ 5.481 de faturamento inventado**, ticket médio de R$ 96,16 e nomes como "Ana Silva" e "Thiago Oliveira" com e-mail `@exemplo.com`.

**Por que é o primeiro item:** se a Marta começar a usar com esses dados dentro, todo número que ela olhar estará errado. E não dá para saber depois qual pedido era real e qual era teste.

**O que fazer:** apagar usuários com e-mail `@exemplo.com` / `@example.com` e os pedidos ligados a eles. Preservar as duas contas reais (admin e a sua). É um script, roda uma vez.

> O `db:seed-demo` já está travado — exige `ALLOW_DEMO_SEED=1` — então não volta sozinho.

---

## 2. E-mail transacional (está quebrado em silêncio)

**Situação:** `lib/email.ts:3` usa como remetente:

```
process.env.RESEND_FROM_EMAIL || "Marta Confeitaria <onboarding@resend.dev>"
```

A variável `RESEND_FROM_EMAIL` **não existe no `.env`**, então vale o padrão. O domínio `resend.dev` é de teste e só entrega para o dono da conta Resend.

**Consequência:** confirmação de cadastro e "esqueci minha senha" **provavelmente não chegam a nenhum cliente**. Ninguém recebe erro — simplesmente não chega.

**O que fazer:**
1. Verificar um domínio próprio no painel do Resend.
2. Definir `RESEND_FROM_EMAIL` na Vercel (ex.: `Marta Confeitaria <contato@martaconfeitaria.com.br>`).
3. Testar criando uma conta com um e-mail externo e conferindo se chega.

---

## 3. Pagamento pelo Mercado Pago

**Situação:** nenhuma chave configurada. A aba **Pagamentos** do painel diz "Nenhum token configurado ainda". Todo checkout está caindo no caminho de WhatsApp — **nenhuma cobrança automática acontece**.

**O que fazer:**
1. Marta cria (ou usa) uma conta Mercado Pago.
2. Pega o *Access Token* de produção no painel de desenvolvedores dela.
3. Cola em **Painel → Pagamentos**. Não precisa deploy.
4. Cadastra o webhook do evento `payment` apontando para `/api/checkout/webhook` no domínio da loja, e cola a chave secreta no mesmo lugar.

> Sem a chave secreta o webhook rejeita as notificações — é ela que prova que a notificação veio mesmo do Mercado Pago.

**Nunca foi testado de ponta a ponta.** Nenhum pagamento real passou pelo sistema ainda. Depois de configurar, fazer uma compra de valor baixo e conferir se o pedido é marcado como pago sozinho.

---

## 4. O catálogo é fictício

**Situação:** os 12 produtos no banco vieram do seed — "Cenoura com chocolate", "Prestígio", "Ninho com Nutella", "Bolo de aniversário"... com fotos genéricas do projeto, não da Marta.

**O que fazer:** levantar com ela o cardápio real (sabores, preços, categorias) e as fotos dos produtos dela. Cadastrar pelo painel e desativar/excluir o que for do seed.

---

## 5. Endereço e pontos de venda inventados

**Situação:** dados fictícios aparecendo em lugares visíveis e indexados pelo Google:

| Onde | O que está lá |
|---|---|
| Mapa e página de contato | "Rua das Framboesas, 122 — Centro, Salgueiro - PE" |
| Pontos de venda | "Padaria Bela Vista" e "Empório Vila Doce" |
| Dados estruturados (`app/layout.tsx`) | Mesmo endereço fictício, lido pelo Google |
| Horário de funcionamento (`app/contato/page.tsx`) | "Terça a sábado, 9h às 18h · Domingo 9h às 13h" — confirmar |

**O que fazer:** endereço real no painel (Pontos de venda) e no `app/layout.tsx`. Se ainda não houver revendedores, remover os dois pontos fictícios em vez de deixá-los no mapa.

---

## 6. Domínio próprio

**Situação:** a loja está em `marta-confeitaria.vercel.app`. O endereço está fixo em três arquivos:

- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`

**O que fazer:** registrar o domínio, apontar na Vercel e trocar a constante `SITE_URL` nos três arquivos. Vale extrair para um único lugar na mesma mexida, para não divergir depois — mesmo problema que o número de WhatsApp já teve.

---

## 7. Redes sociais

**Situação:** `components/layout/Footer.tsx:11-12` — `FACEBOOK_URL` e `INSTAGRAM_URL` estão vazios. Os ícones aparecem no rodapé e não levam a lugar nenhum.

**O que fazer:** pegar os perfis reais e preencher. Se não houver Facebook, remover o ícone em vez de deixá-lo morto.

---

## 8. Não existe entrega nem retirada

**O buraco maior desta lista.** O modelo `Order` (`prisma/schema.prisma`) não tem endereço, não tem frete e não tem escolha entre retirar no local e receber em casa. Não há nenhuma menção a frete, entrega ou CEP em `app/api/checkout/` nem em `components/cart/`.

**Consequência:** o pedido entra no sistema e ninguém sabe **para onde ele vai**. Hoje isso só não quebra porque o checkout está caindo no WhatsApp, onde a conversa resolve. No dia em que o pagamento pelo site for ativado (item 3), o pedido vai ser **pago** sem endereço nenhum.

**Decisões que precisam vir da cliente antes de programar:**

- Ela entrega, ou é só retirada no local?
- Se entrega: cobra frete? Valor fixo, por bairro, ou grátis acima de um valor?
- Tem raio de entrega? Quais bairros atende?
- Tem prazo/janela de horário para agendar?

Dependendo da resposta, muda o modelo de dados, o checkout e a tela de pedidos do painel. **Não dá para ativar o pagamento no site sem resolver isto.**

---

## 9. Pedido de visitante chega sem contato nenhum

**Situação:** `Order` tem `guestName`, `guestEmail` e `guestPhone`, mas o carrinho **nunca os preenche**. Em `components/cart/CartContext.tsx`, o checkout envia apenas `{ items: cart }` — os três campos ficam sempre nulos.

**Consequência:** um visitante compra e o pedido aparece no painel como "Visitante", sem telefone e sem e-mail. Não há como avisar que ficou pronto, nem como resolver qualquer problema.

**O que fazer:** pedir nome e WhatsApp no carrinho antes de finalizar, quando não houver login. São dois campos — resolve junto com o item 8, que também precisa mexer nessa tela.

---

## 10. Obrigações legais de loja online

Vendendo pela internet no Brasil, algumas coisas são exigidas por lei e hoje não existem:

- **Identificação do vendedor** — CNPJ (ou CPF), razão social e endereço precisam estar visíveis, normalmente no rodapé.
- **Política de troca e devolução** — o Código de Defesa do Consumidor dá 7 dias de arrependimento em compra online. Alimento perecível tem particularidades, mas a política precisa estar escrita.
- **Prazo de entrega informado** antes da compra.
- **Revisar `/termos` e `/privacidade`** — as duas páginas existem, mas foram escritas como texto de partida e precisam refletir o que a operação realmente faz e coleta.

Vale confirmar com contador ou advogado o que se aplica ao caso dela.

---

## 11. Dívidas técnicas conhecidas

Nada aqui impede vender. Fica registrado para não virar surpresa:

- **Carrinho lateral não é um diálogo acessível** — não prende o foco, não fecha com `Esc`, não devolve o foco ao fechar. A navegação por teclado no resto do site já foi corrigida.
- **Imagens sem largura e altura declaradas** — o layout dá um pequeno salto enquanto carregam.
- **Carrinho identifica produto pelo nome, não pelo id** — renomear um produto no painel esvazia esse item dos carrinhos abertos. `Product.name` também não é único no banco.
- **Sem busca e sem ordenação** no catálogo. Com 12 produtos não incomoda; com 60, sim.
- **`stock = 1` é indistinguível de estoque ilimitado** para o cliente — não existe aviso de "últimas unidades".
- **Código repetido** — quatro cópias do botão de adicionar, três do componente de imagem e sete do formatador de moeda.

---

## O que ainda não foi testado

Registro honesto do que **não** foi verificado, para não haver surpresa:

- **Pagamento de ponta a ponta** — depende do item 3.
- **Webhook do Mercado Pago** — o código valida a assinatura, mas nunca recebeu notificação real.
- **Envio de e-mail** — nenhum e-mail foi disparado de verdade (ver item 2).
- **Cadastro de cliente novo** — fluxo completo, do zero, nunca executado.
- **Estoque ao vivo** — os 12 produtos estão com estoque `null` (ilimitado). A lógica tem teste automatizado, mas nunca rodou com estoque real definido.
- **Cadastro/edição/exclusão de produto pelo painel.**
- **Área do parceiro** (`/parceiro`).
- **iPhone real** — as correções de zoom em formulário, `backdrop-filter` e altura de tela foram feitas e conferidas no CSS publicado, mas não testadas num aparelho.
- **Navegação por teclado** — corrigida no código, sem verificação visual do anel de foco.

O que **está** coberto: 29 testes automatizados (carrinho, falhas de checkout, estados do catálogo, contato, rate limit), `tsc` e `build` limpos, e as páginas respondendo em produção.
