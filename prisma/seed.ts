import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: "Chocolate intenso", category: "Fatia", price: 12, imageUrl: "/images/slice-chocolate.webp" },
  { name: "Red velvet", category: "Fatia", price: 14, imageUrl: "/images/slice-red-velvet.webp" },
  { name: "Cenoura com chocolate", category: "Fatia", price: 10, imageUrl: "/images/slice-cenoura.webp" },
  { name: "Prestígio", category: "Fatia", price: 13, imageUrl: "/images/slice-prestigio.webp" },
  { name: "Ninho com Nutella", category: "Fatia", price: 15, imageUrl: "/images/slice-ninho.webp" },
  { name: "Limão siciliano", category: "Fatia", price: 12, imageUrl: "/images/slice-limao.webp" },
  { name: "Floresta negra", category: "Fatia", price: 16, imageUrl: "/images/slice-floresta-negra.webp" },
  { name: "Maracujá", category: "Fatia", price: 12, imageUrl: "/images/slice-maracuja.webp" },
  { name: "Fubá cremoso", category: "Fatia", price: 9, imageUrl: "/images/slice-fuba.webp" },
  { name: "Bolo de aniversário", category: "Bolo inteiro", price: 75, imageUrl: "/images/cake-10.jpg" },
  { name: "Bolo de festa", category: "Bolo inteiro", price: 75, imageUrl: "/images/cake-11.webp" },
  { name: "Bolo temático", category: "Bolo inteiro", price: 75, imageUrl: "/images/cake-12.jpg" },
];

async function main() {
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) await prisma.product.create({ data: p });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@martaconfeitaria.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "TrocarSenha123!";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: { name: "Marta (admin)", email: adminEmail, passwordHash, role: "ADMIN" },
    });
    console.log(`Admin criado: ${adminEmail} / senha inicial: ${adminPassword} (troque depois do primeiro login)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
