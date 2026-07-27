/**
 * Remove os dados de demonstração que o `db:seed-demo` criou no banco.
 *
 * O banco de produção ficou com clientes e pedidos fictícios misturados aos
 * reais. Enquanto estiverem lá, todo número do painel — faturamento, ticket
 * médio, sabor mais vendido — está errado, e depois de um tempo ninguém mais
 * consegue distinguir o que era teste.
 *
 * Por padrão apenas **mostra** o que seria apagado. Nada é removido sem
 * `--confirmar`.
 *
 *   npm run db:limpar-demo               # simulação, não apaga nada
 *   npm run db:limpar-demo -- --confirmar
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Domínios usados pelo seed de demonstração. Contas reais nunca os usam. */
const DEMO_DOMAINS = ["@exemplo.com", "@example.com"];

const confirmar = process.argv.includes("--confirmar");

function dbHost() {
  const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? "";
  return url.replace(/^.*@/, "").replace(/[/?].*$/, "") || "(desconhecido)";
}

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { OR: DEMO_DOMAINS.map((d) => ({ email: { endsWith: d } })) },
    select: { id: true, name: true, email: true, role: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);

  // Pedidos de demonstração: os que pertencem a um usuário demo, mais os de
  // visitante cujo e-mail informado usa um domínio de exemplo.
  const demoOrders = await prisma.order.findMany({
    where: {
      OR: [
        ...(demoUserIds.length ? [{ userId: { in: demoUserIds } }] : []),
        ...DEMO_DOMAINS.map((d) => ({ guestEmail: { endsWith: d } })),
      ],
    },
    select: { id: true, code: true, total: true, createdAt: true },
  });

  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.order.count();

  console.log("");
  console.log(`  Banco alvo: ${dbHost()}`);
  console.log("");
  console.log(`  Usuários no banco : ${totalUsers}`);
  console.log(`  De demonstração   : ${demoUsers.length}`);
  console.log(`  Reais (preservados): ${totalUsers - demoUsers.length}`);
  console.log("");
  console.log(`  Pedidos no banco  : ${totalOrders}`);
  console.log(`  De demonstração   : ${demoOrders.length}`);
  console.log(`  Reais (preservados): ${totalOrders - demoOrders.length}`);
  console.log("");

  if (!demoUsers.length && !demoOrders.length) {
    console.log("  Nada de demonstração encontrado. Banco já está limpo.");
    return;
  }

  console.log("  Contas que seriam apagadas:");
  for (const u of demoUsers) console.log(`    - ${u.name} <${u.email}> (${u.role})`);
  console.log("");

  const preservados = await prisma.user.findMany({
    where: { NOT: { OR: DEMO_DOMAINS.map((d) => ({ email: { endsWith: d } })) } },
    select: { name: true, email: true, role: true },
  });
  console.log("  Contas que seriam PRESERVADAS:");
  for (const u of preservados) console.log(`    - ${u.name} <${u.email}> (${u.role})`);
  console.log("");

  if (!confirmar) {
    console.log("  SIMULAÇÃO — nada foi apagado.");
    console.log("  Confira a lista acima. Para executar de verdade:");
    console.log("    npm run db:limpar-demo -- --confirmar");
    console.log("");
    return;
  }

  // Apagar os pedidos antes dos usuários deixa o passo explícito, em vez de
  // depender do cascade — pedido de visitante não tem usuário para cascatear.
  const orderIds = demoOrders.map((o) => o.id);
  const removed = await prisma.$transaction(async (tx) => {
    const items = orderIds.length
      ? await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } })
      : { count: 0 };
    const orders = orderIds.length
      ? await tx.order.deleteMany({ where: { id: { in: orderIds } } })
      : { count: 0 };
    const users = demoUserIds.length
      ? await tx.user.deleteMany({ where: { id: { in: demoUserIds } } })
      : { count: 0 };
    return { items: items.count, orders: orders.count, users: users.count };
  });

  console.log(`  Apagados: ${removed.users} usuários, ${removed.orders} pedidos, ${removed.items} itens de pedido.`);
  console.log("  O catálogo de produtos não foi tocado.");
  console.log("");
}

main()
  .catch((e) => {
    console.error("Falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
