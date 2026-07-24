# Marta Confeitaria

Site institucional e loja da Marta Confeitaria — bolos e fatias artesanais. Construído com Next.js (App Router), com back-end de contas, carrinho, pedidos e painel administrativo ligado a um banco Postgres.

**Produção:** https://marta-confeitaria.vercel.app

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript
- **Prisma 6** como ORM, banco **Postgres** (Neon, provisionado via integração Vercel Postgres)
- **Auth.js (NextAuth v5)** com login por e-mail/senha (credentials + bcrypt)
- Estilização em CSS Modules + inline styles (sem framework de UI)
- Deploy automático na **Vercel** a cada push em `main`

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:2888
```

As variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET` etc.) ficam em `.env.local` / `.env`, puxadas do projeto na Vercel:

```bash
vercel env pull .env.local
cp .env.local .env   # o Prisma CLI só lê .env por padrão
```

## Banco de dados

```bash
npx prisma migrate dev --name nome_da_mudanca   # cria e aplica uma migration
npx prisma studio                               # explorar o banco visualmente
npm run db:seed                                 # popula produtos + conta admin inicial
```

O banco local e o de produção são **o mesmo banco** (não há branch separada por ambiente) — qualquer migration/seed rodada localmente já reflete em produção.

### Modelo de dados (`prisma/schema.prisma`)

- **User** — nome, e-mail, senha (hash), `role` (`CUSTOMER` | `PARTNER` | `ADMIN`)
- **Product** — nome, categoria, preço, imagem, `active`
- **CartItem** — carrinho por usuário logado; ao excluir um produto, o item some do carrinho automaticamente (cascade), sem erro pro cliente
- **Order** / **OrderItem** — pedidos finalizados. Cada item guarda uma **cópia** (snapshot) do nome e preço do produto no momento da compra, então o histórico continua correto mesmo que o produto seja excluído depois (`productId` fica `null`, mas `nameSnapshot`/`priceSnapshot` preservam o registro)
- **ActivityLog** — log de ações da conta (cadastro, login, adicionou ao carrinho, removeu, finalizou pedido), exibido no painel do cliente

## Autenticação e papéis

Três tipos de usuário (`Role` no schema):

| Papel | Acesso |
|---|---|
| `CUSTOMER` | conta padrão — carrinho salvo, histórico de pedidos, log de atividade em `/conta` |
| `PARTNER` | pontos de revenda — tem área própria em `/parceiro` (dados da conta, pontos de venda cadastrados, log de atividade); login em `/conta` redireciona automaticamente pra lá |
| `ADMIN` | acesso ao painel `/admin/dashboard` |

- Cadastro/login em `/conta` (`POST /api/register`, depois `signIn` via Auth.js)
- `middleware.ts` protege `/admin/*` e `/api/admin/*` (só `ADMIN`) e `/parceiro/*` (`PARTNER` ou `ADMIN`); sem permissão, redireciona pra `/conta`
- A config do Auth.js é dividida em `auth.config.ts` (sem dependências de Node — usada pelo middleware, que roda em Edge Runtime) e `auth.ts` (config completa com Prisma/bcrypt, usada nas API routes)

## Catálogo

Home, `/cardapio` e `/bolos` buscam o catálogo real em `/api/public/products` (produtos ativos, por categoria `Fatia` / `Bolo inteiro`). Se o banco estiver vazio, cada página cai num catálogo fixo de fallback para nunca ficar em branco.

## Carrinho e checkout

- **Visitante não logado:** carrinho fica só no `localStorage`, igual antes — comprar sem conta continua funcionando
- **Logado:** carrinho é lido/gravado no banco (`/api/cart`), sincroniza entre dispositivos e some da tela ao fazer login
- **Checkout:** `POST /api/orders` transforma o carrinho num `Order` no banco (com snapshot dos itens), limpa o carrinho, e abre o WhatsApp com a mensagem do pedido — não há gateway de pagamento, o fechamento continua manual via WhatsApp

## Painel administrativo (`/admin/dashboard`)

- **Dashboard** — receita por dia (30 dias), pedidos por status, produtos mais vendidos e tiles de receita/pedidos/ticket médio/clientes/produtos ativos. Gráficos em SVG próprio, sem lib externa.
- **Produtos** — CRUD completo, ligado ao banco (grade de cards)
- **Pedidos** — lista todos os pedidos com cliente, itens e status editável
- **Usuários** — lista todas as contas, permite trocar o papel (cliente/parceiro/admin) e excluir. Um admin não consegue rebaixar/excluir a própria conta por essa tela.
- **Seções da landing** / **Pontos de venda** — ligam/desligam blocos da home e cadastram pontos de revenda direto no banco (`HeroFlavor`, `SalesPoint`, `SiteSection`); a home e `/onde-encontrar` leem essas tabelas via `/api/public/landing` e `/api/public/sales-points`.

Para popular o dashboard com dados de teste (clientes e pedidos simulados nos últimos 45 dias): `npm run db:seed-demo`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (porta 2888) |
| `npm run build` | build de produção (o mesmo que a Vercel roda) |
| `npm run db:seed` | popula o catálogo inicial e cria a conta admin (se não existir) |

## Deploy

Push em `main` → Vercel builda e publica automaticamente. Para forçar manualmente:

```bash
vercel --prod --yes
```

O projeto está sob a org `nolei98s-projects` (plano Hobby). Deploys só passam se o **autor do commit for a conta dona do projeto na Vercel** — plano Hobby não permite colaboradores em repositório privado (o repo hoje é público, o que evita esse bloqueio).

## E-mail (Resend)

- Cadastro envia e-mail de confirmação (`/api/auth/verify-email?token=...`); "esqueci minha senha" em `/esqueci-senha` envia link de redefinição (`/redefinir-senha?token=...`, válido por 1h).
- Provedor: [Resend](https://resend.com). Sem `RESEND_API_KEY` configurada, o envio degrada com graceful fallback — o e-mail (com o link) é só logado no console do servidor, sem quebrar o fluxo.
- Variáveis: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (opcional, default `onboarding@resend.dev`).

## Imagens de produto

Fotos de produto sobem para um **Vercel Blob store** público (`marta-confeitaria-images`) via `POST /api/admin/upload` (admin-only, até 5MB, jpeg/png/webp/gif) — o campo `imageUrl` do produto guarda a URL do blob, não mais base64.

## Segurança

- Login e cadastro têm rate limiting (`LoginAttempt`, banco): 8 tentativas por 15 min por e-mail/IP no login, 8 cadastros por hora por IP.
