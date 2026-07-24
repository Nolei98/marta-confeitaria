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

async function main() {
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
