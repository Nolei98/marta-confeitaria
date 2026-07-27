import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST_NAMES = ["Ana", "Carlos", "Juliana", "Rafael", "Fernanda", "Bruno", "Camila", "Diego", "Larissa", "Marcos", "Patrícia", "Thiago"];
const LAST_NAMES = ["Silva", "Souza", "Oliveira", "Costa", "Pereira", "Lima", "Almeida", "Ferreira", "Rodrigues", "Gomes"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomInt(9, 20), randomInt(0, 59), 0, 0);
  return d;
}

/**
 * The .env here is pulled straight from Vercel, so DATABASE_URL points at the
 * same Neon database the live site uses. Nothing in this script deletes
 * anything, but it does inject fake customers and dozens of fake orders — which
 * would land in Marta's real order history and skew the admin dashboard's
 * revenue numbers. Require an explicit opt-in rather than trusting the operator
 * to remember which database they are pointed at.
 */
function assertDemoSeedAllowed() {
  if (process.env.ALLOW_DEMO_SEED === "1") return;
  const host = (process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? "")
    .replace(/^.*@/, "")
    .replace(/[/?].*$/, "");
  console.error(
    [
      "",
      "  Recusando rodar o seed de demonstração.",
      "",
      `  Banco alvo: ${host || "(desconhecido)"}`,
      "",
      "  Este script cria clientes e pedidos falsos. Se esse banco for o de",
      "  produção, eles entram no histórico real da Marta e distorcem o",
      "  faturamento no painel do admin.",
      "",
      "  Se for mesmo um banco descartável, rode:",
      "    ALLOW_DEMO_SEED=1 npm run db:seed-demo",
      "",
    ].join("\n")
  );
  process.exit(1);
}

async function main() {
  assertDemoSeedAllowed();
  const products = await prisma.product.findMany();
  if (!products.length) {
    console.log("Rode `npm run db:seed` primeiro para criar o catálogo.");
    return;
  }

  // A handful of fake customers, spread across the last 45 days of signups.
  const customers = [];
  for (let i = 0; i < 10; i++) {
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@exemplo.com`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      customers.push(existing);
      continue;
    }
    const passwordHash = await bcrypt.hash("demo1234", 10);
    const createdAt = daysAgo(randomInt(1, 45));
    const user = await prisma.user.create({
      data: { name: `${first} ${last}`, email, passwordHash, role: "CUSTOMER", createdAt },
    });
    customers.push(user);
  }

  // One demo partner account.
  const partnerEmail = "parceiro.demo@exemplo.com";
  const existingPartner = await prisma.user.findUnique({ where: { email: partnerEmail } });
  if (!existingPartner) {
    const passwordHash = await bcrypt.hash("demo1234", 10);
    await prisma.user.create({
      data: { name: "Padaria Bela Vista", email: partnerEmail, passwordHash, role: "PARTNER" },
    });
  }

  const statusByAge = (ageDays: number) => {
    if (ageDays > 3) return "ENTREGUE";
    const roll = Math.random();
    if (roll < 0.4) return "ENTREGUE";
    if (roll < 0.65) return "PRONTO";
    if (roll < 0.85) return "EM_PREPARO";
    return "PENDENTE";
  };

  let created = 0;
  for (let day = 44; day >= 0; day--) {
    const ordersToday = randomInt(0, 4);
    for (let i = 0; i < ordersToday; i++) {
      const customer = randomFrom(customers);
      const itemCount = randomInt(1, 3);
      const chosen = new Set<number>();
      while (chosen.size < itemCount) chosen.add(randomInt(0, products.length - 1));

      const items = Array.from(chosen).map((idx) => {
        const p = products[idx];
        const qty = randomInt(1, 3);
        return { productId: p.id, nameSnapshot: p.name, priceSnapshot: p.price, qty };
      });
      const total = items.reduce((sum, it) => sum + Number(it.priceSnapshot) * it.qty, 0);
      const code = "#" + (2000 + created);
      const createdAt = daysAgo(day);

      await prisma.order.create({
        data: {
          code,
          userId: customer.id,
          total,
          status: statusByAge(day),
          createdAt,
          items: { create: items },
        },
      });
      created++;
    }
  }

  console.log(`Gerados: ${customers.length} clientes demo, 1 parceiro demo, ${created} pedidos simulados nos últimos 45 dias.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
