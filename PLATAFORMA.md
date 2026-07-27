# Marta Confeitaria — Documentação da Plataforma

Documento de referência completo sobre o site e sistema da Marta Confeitaria: o que existe, como funciona, e como cada parte se conecta. Para instruções técnicas de setup/deploy, ver [`README.md`](./README.md) — este arquivo foca em **o que a plataforma faz e como está organizada**.

**Produção:** https://marta-confeitaria.vercel.app

---

## 1. Visão geral

A Marta Confeitaria é uma loja de bolos e fatias artesanais com:

- Site institucional (home, cardápio, sobre, contato) com catálogo real vindo do banco de dados
- Contas de cliente, com carrinho salvo, histórico de pedidos e dados de perfil
- Checkout com pagamento online (Mercado Pago) ou, na ausência de configuração, fluxo manual via WhatsApp
- Área própria para pontos de venda parceiros
- Painel administrativo completo: produtos, pedidos, usuários, conteúdo da landing page, configuração de pagamento e dashboard com gráficos

Construído em **Next.js 14** (App Router), com banco **Postgres** (Neon) via **Prisma**, hospedado na **Vercel**.

---

## 2. Perfis de usuário

O sistema tem três papéis (`Role` no banco), cada um com sua própria área:

| Papel | Onde entra | O que vê |
|---|---|---|
| **Visitante** (sem conta) | Todo o site público | Navega, compra sem precisar de conta — carrinho fica no navegador (`localStorage`) |
| `CUSTOMER` (cliente) | `/conta` | Dashboard próprio: catálogo, encomenda de bolo, histórico de pedidos, edição de conta |
| `PARTNER` (parceiro) | `/parceiro` (login em `/conta` redireciona pra lá automaticamente) | Dados da conta, pontos de venda cadastrados, log de atividade |
| `ADMIN` | `/admin/dashboard` (login em `/conta` redireciona pra lá automaticamente) | Painel administrativo completo |

Todo mundo começa como `CUSTOMER` ao se cadastrar — só um admin pode promover alguém a `PARTNER` ou `ADMIN`, pela aba **Usuários** do painel.

### 2.1 Visitante (sem login)

- Navega livremente: `/`, `/cardapio`, `/bolos`, `/sobre`, `/contato`
- Carrinho funciona sem conta — fica salvo no `localStorage` do navegador
- Pode finalizar a compra sem se cadastrar: o pedido é gravado no banco mesmo assim (com `userId` nulo), e o checkout é o mesmo fluxo dos clientes logados (Mercado Pago ou WhatsApp)
- Formulário de encomenda de bolo (`/bolos`) tem captcha (soma simples) pra evitar spam de bots

### 2.2 Cliente (`CUSTOMER`)

Ao logar, cai direto no dashboard em `/conta`, com:

- **Saudação amigável** + foto de perfil (ou inicial do nome)
- **Aviso de confirmação de e-mail**, se ainda não confirmou, com botão de reenvio (cooldown de 20s)
- **Catálogo** (aba padrão) — grade de fatias com "+" pra adicionar ao carrinho, no mesmo estilo visual usado no resto do site
- **Encomendar bolo** — mesmo formulário usado em `/bolos`, só que embutido direto no dashboard (não navega pra outra página)
- **Meus pedidos** — histórico com status de preparo e status de pagamento
- **Editar conta** — nome, telefone, foto de perfil (upload), e troca de e-mail/senha (exige senha atual)

O menu do site (cabeçalho), quando o cliente está logado, fica reduzido a **Início** e **Contato** — cardápio, bolos e sobre "moram" dentro do dashboard agora. Se o cliente tentar acessar `/cardapio`, `/sobre` ou `/revenda` diretamente, é redirecionado de volta pro dashboard (`/bolos` continua acessível, pois é a mesma tela da aba "Encomendar bolo").

### 2.3 Parceiro (`PARTNER`)

Pontos de revenda (padarias, mercados que revendem as fatias da Marta). Área em `/parceiro`:

- Dados da conta (nome, e-mail)
- Lista de pontos de venda cadastrados (mesma tabela que alimenta `/contato`)
- Log de atividade da conta
- Aviso de confirmação de e-mail, se aplicável

### 2.4 Administrador (`ADMIN`)

Painel completo em `/admin/dashboard`, com 8 abas:

1. **Dashboard** — receita por dia (30 dias), pedidos por status, produtos mais vendidos, e tiles de receita/pedidos/ticket médio/clientes/produtos ativos. Gráficos em SVG próprio.
2. **Produtos** — CRUD completo (criar, editar, ativar/desativar, excluir), com upload de foto real (Vercel Blob).
3. **Seções da landing** — liga/desliga blocos da home (hero, fatias do dia, mais vendidos, chamada de bolos) e edita os sabores do carrossel do hero.
4. **Pontos de venda** — cadastra/edita/remove os pontos de revenda mostrados em `/contato`.
5. **Pedidos** — lista todos os pedidos (com conta ou visitante), com status de pagamento (Mercado Pago) e status de preparo editável.
6. **Usuários** — lista todas as contas, permite trocar o papel (cliente/parceiro/admin) e excluir. Um admin não consegue rebaixar/excluir a própria conta.
7. **Pagamentos** — Access Token e Chave secreta do Mercado Pago, salvos no banco (mascarados na tela depois de salvos).

Sair do painel usa o botão de logout de verdade (encerra a sessão) — não é só um link de volta pro site.

---

## 3. Catálogo

Home, `/cardapio` e `/bolos` leem os produtos reais do banco (`/api/public/products`), filtrando por categoria (`Fatia` / `Bolo inteiro`) e só produtos `active`. Se o banco estiver vazio (nunca deveria acontecer em produção), cada página cai num catálogo fixo de emergência pra nunca ficar em branco.

O admin gerencia esse catálogo na aba **Produtos** — as mudanças aparecem no site na hora (sem precisar de deploy).

### Estoque

Cada produto tem um campo `stock` opcional:

- **Em branco (`null`):** estoque não controlado, venda ilimitada — é o padrão.
- **Preenchido:** o carrinho recusa quantidade acima do disponível (HTTP 409, "Estoque insuficiente") e o checkout decrementa o estoque de forma atômica, com a condição `stock >= qty` na própria query. Dois clientes disputando a última fatia não conseguem comprar os dois.

Se o pagamento for **rejeitado ou cancelado**, o webhook do Mercado Pago devolve o estoque — e só uma vez, mesmo que a mesma notificação chegue repetida.

---

## 4. Carrinho e checkout

- **Visitante:** carrinho no `localStorage`.
- **Cliente logado:** carrinho gravado no banco (`CartItem`), sincroniza entre dispositivos, some do `localStorage` ao logar.
- **Se um produto no carrinho for excluído pelo admin:** o item some do carrinho automaticamente, sem erro nenhum pro cliente (é assim desde o começo do projeto — uma das regras mais importantes do sistema).

### Checkout

`POST /api/checkout` é o ponto único de entrada, pra visitante ou cliente:

1. Cria um `Order` no banco com o "retrato" dos itens no momento da compra (nome e preço copiados — se o produto for excluído depois, o pedido continua mostrando certo no histórico).
2. **Com Mercado Pago configurado:** cria uma preferência de pagamento (Checkout Pro) e redireciona o cliente pra lá. Depois do pagamento, ele volta pra `/checkout/retorno` (sucesso/pendente/falha).
3. **Sem Mercado Pago configurado:** abre o WhatsApp com o resumo do pedido (fluxo original, sempre disponível como plano B).

O status de **pagamento** (`Order.paymentStatus`) é atualizado automaticamente por um webhook do Mercado Pago (`/api/checkout/webhook`), que valida a assinatura da notificação antes de confiar nela. O status de **preparo** (`Order.status`: pendente/em preparo/pronto/entregue) continua sendo controlado manualmente pelo admin — são duas coisas independentes.

Tanto o checkout quanto o login/cadastro têm **limite de tentativas** (rate limiting) pra evitar abuso.

---

## 5. Autenticação, contas e segurança

- Login/cadastro em `/conta` (e-mail + senha, com telefone obrigatório no cadastro).
- Senhas com hash (bcrypt), nunca guardadas em texto puro.
- **Confirmação de e-mail** no cadastro — link válido por 24h, com botão de reenvio.
- **"Esqueci minha senha"** (`/esqueci-senha` → `/redefinir-senha`) — link válido por 1h. A resposta da API nunca revela se o e-mail existe ou não (proteção contra descoberta de contas).
- **Foto de perfil** — upload de JPG/PNG/WEBP até 2MB (Vercel Blob), disponível na aba "Editar conta".
- **Rate limiting** em login, cadastro e checkout — bloqueio temporário por e-mail e por IP depois de várias tentativas seguidas.
- **Proteção de rotas:** `/admin/*` só pra `ADMIN`; `/parceiro/*` só pra `PARTNER`/`ADMIN`. Checado em duas camadas — no `middleware.ts` (bloqueia a navegação) e de novo dentro de cada rota de API (defesa extra, mesmo que alguém tente burlar o middleware).
- Um admin **não consegue** rebaixar o próprio papel nem excluir a própria conta pela tela de Usuários (evita se trancar fora do painel por engano).

---

## 6. E-mail transacional

Provedor: **Resend**. Usado pra:

- Confirmação de e-mail no cadastro
- Link de redefinição de senha
- Reenvio de confirmação (dashboard do cliente/parceiro)

**Sem `RESEND_API_KEY` configurada, os e-mails degradam de forma segura**: o conteúdo (com o link) é só registrado no log do servidor, sem quebrar nenhum fluxo. Isso permite o site funcionar 100% mesmo antes de configurar o provedor de e-mail.

---

## 7. Pagamento (Mercado Pago)

- **Checkout Pro** (página de pagamento hospedada pelo Mercado Pago — aceita cartão, Pix e boleto).
- As credenciais (**Access Token** e **Chave secreta do webhook**) são configuradas **pelo próprio admin, direto no painel** (`/admin/dashboard` → aba **Pagamentos**) — não é preciso mexer em variável de ambiente na Vercel. Ficam guardadas no banco, mascaradas na tela depois de salvas.
- Sem credenciais configuradas, o checkout usa o fluxo antigo (WhatsApp), sem quebrar nada.
- O webhook (`/api/checkout/webhook`) recebe as notificações de mudança de status de pagamento, valida a assinatura, e atualiza o pedido correspondente automaticamente.

---

## 8. SEO e presença digital

- **`sitemap.xml`** e **`robots.txt`** gerados automaticamente, cobrindo as páginas públicas e bloqueando áreas privadas (`/admin`, `/parceiro`, páginas de recuperação de senha).
- **Dados estruturados** (schema.org, tipo `Bakery`) no `<head>` de toda página: endereço, geolocalização, telefone, horário de funcionamento — ajuda o Google a entender que é um negócio local (aparece melhor no Google Maps e nas buscas).
- **Open Graph e Twitter Card** configurados com a logo, título e descrição — controla como o link do site aparece quando compartilhado no WhatsApp, redes sociais etc.
- **Favicon** herda a logo da marca (`app/icon.png`, `app/apple-icon.png` — convenção do Next.js).

---

## 9. Modelo de dados (resumo)

| Tabela | Guarda |
|---|---|
| `User` | conta (nome, e-mail, senha, telefone, foto, papel, e-mail confirmado?) |
| `Product` | catálogo (nome, categoria, preço, foto, ativo?) |
| `CartItem` | carrinho de cada cliente logado |
| `Order` / `OrderItem` | pedidos — com ou sem conta; cada item guarda uma cópia do nome/preço no momento da compra |
| `PaymentSettings` | credenciais do Mercado Pago (linha única, editada pelo admin) |
| `HeroFlavor` | sabores do carrossel da home |
| `SalesPoint` | pontos de venda/revenda |
| `SiteSection` | liga/desliga blocos da home |
| `VerificationToken` | tokens de confirmação de e-mail / redefinição de senha |
| `LoginAttempt` | controle de rate limiting |
| `ActivityLog` | histórico de ações da conta (login, cadastro, pedido, etc.) |

Detalhe importante: quando um produto é excluído, ele some de qualquer carrinho automaticamente (sem erro), mas o histórico de pedidos que já incluía esse produto continua correto — porque `OrderItem` guarda uma cópia do nome e preço, não depende do produto continuar existindo.

---

## 10. Stack técnica (resumo)

- **Next.js 14** (App Router) + React 18 + TypeScript
- **Prisma 6** + **Postgres** (Neon)
- **Auth.js (NextAuth v5)** — login por e-mail/senha, sessão JWT
- **Vercel Blob** — armazenamento de imagens (produtos e fotos de perfil)
- **Resend** — envio de e-mail transacional
- **Mercado Pago** — gateway de pagamento (Checkout Pro)
- Estilização em CSS Modules + inline styles (sem framework de UI)
- **Vitest** + **Testing Library** — testes de lógica pura e de componente (`npm test`)
- Deploy automático na Vercel a cada push em `main`

### Contato

O número de WhatsApp da loja mora em um único lugar: [`lib/contact.ts`](./lib/contact.ts) (`WHATSAPP_NUMBER`, `WHATSAPP_URL`, `WHATSAPP_DISPLAY`, `WHATSAPP_E164`, `whatsappLink()`). Header, footer, home, `/contato`, `/revenda`, formulário de encomenda, carrinho, páginas legais e o JSON-LD do `layout.tsx` todos importam de lá. Para trocar o número, edite só esse arquivo.

Para comandos de desenvolvimento, variáveis de ambiente e instruções de deploy, ver o [`README.md`](./README.md).

---

## 11. Estado atual

Testado de ponta a ponta (visitante, cliente, parceiro e admin) — carrinho, checkout, cadastro, confirmação de e-mail, redefinição de senha, proteção de rotas por papel, controle de estoque, e a regra de "produto excluído não quebra pedido/carrinho" — tudo funcionando. `npm run build` e `npm test` passam limpos.

Pontos que ficaram de fora de propósito:

- **Formulários de contato/revenda/encomenda** entregam a mensagem via WhatsApp (deeplink `wa.me`), não por e-mail nem gravando no banco. Foi decisão de produto: a dona responde tudo pelo WhatsApp mesmo.
- **Redes sociais** — `FACEBOOK_URL` e `INSTAGRAM_URL` em `components/layout/Footer.tsx` estão vazios até a cliente passar os perfis reais.
- **Testes** cobrem a lógica pura (contato, base URL, IP do rate limit) e o fluxo de compra no cliente (carrinho, erros de checkout, estados do catálogo). O que roda contra o banco de verdade — webhook do Mercado Pago, auth, decremento de estoque no servidor — foi validado manualmente, sem teste automatizado.

### Regras que os testes protegem

Duas decisões do fluxo de compra são fáceis de desfazer sem perceber, e existem testes para segurá-las:

1. **Erro de checkout nunca esvazia o carrinho.** Só o caminho de sucesso limpa. Um 409 de estoque, um 429 de rate limit ou um 500 deixam o carrinho como está e mostram a mensagem no drawer.
2. **Não existe catálogo de emergência hardcoded.** Se `/api/public/products` falhar, a página mostra erro com "tentar de novo" — nunca produtos inventados. Catálogo falso é indistinguível do real e leva o cliente a um pedido que o servidor não pode honrar.
