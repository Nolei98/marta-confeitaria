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
| `PARTNER` | reservado para pontos de revenda (ver `/revenda`) — ainda sem área própria implementada |
| `ADMIN` | acesso ao painel `/admin/dashboard` |

- Cadastro/login em `/conta` (`POST /api/register`, depois `signIn` via Auth.js)
- `middleware.ts` protege `/admin/*` e `/api/admin/*`: sem sessão de `ADMIN`, redireciona pra `/conta`
- A config do Auth.js é dividida em `auth.config.ts` (sem dependências de Node — usada pelo middleware, que roda em Edge Runtime) e `auth.ts` (config completa com Prisma/bcrypt, usada nas API routes)

## Carrinho e checkout

- **Visitante não logado:** carrinho fica só no `localStorage`, igual antes — comprar sem conta continua funcionando
- **Logado:** carrinho é lido/gravado no banco (`/api/cart`), sincroniza entre dispositivos e some da tela ao fazer login
- **Checkout:** `POST /api/orders` transforma o carrinho num `Order` no banco (com snapshot dos itens), limpa o carrinho, e abre o WhatsApp com a mensagem do pedido — não há gateway de pagamento, o fechamento continua manual via WhatsApp

## Painel administrativo (`/admin/dashboard`)

- **Produtos** — CRUD completo, ligado ao banco (grade de cards)
- **Pedidos** — lista todos os pedidos com cliente, itens e status editável
- **Seções da landing** / **Pontos de venda** — ainda usam `localStorage` do navegador (não persistem no banco; cada admin vê sua própria versão local). Migrar isso pro banco é um próximo passo natural.

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

## Pendências conhecidas

- Catálogo público (home, cardápio, bolos) ainda é uma lista fixa no código — não lê do banco. O admin já cadastra produtos reais, mas as páginas de venda não os exibem ainda.
- Sem recuperação de senha ("esqueci minha senha") nem confirmação de e-mail no cadastro.
- Upload de imagem de produto salva a foto como base64 direto no banco — funciona, mas não é ideal para muitas imagens grandes (considerar Vercel Blob).
- Papel `PARTNER` existe no schema mas ainda não tem uma área/permissões próprias definidas.
