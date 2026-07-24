import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { DEFAULT_HERO_FLAVORS } from "@/lib/landingDefaults";

async function ensureSeeded() {
  const count = await prisma.heroFlavor.count();
  if (count === 0) {
    await prisma.heroFlavor.createMany({ data: DEFAULT_HERO_FLAVORS });
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  await ensureSeeded();
  const flavors = await prisma.heroFlavor.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(flavors);
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { key, name, desc, price, img, bg } = await req.json();
  if (!key) return NextResponse.json({ error: "Sabor inválido." }, { status: 400 });

  const flavor = await prisma.heroFlavor
    .update({ where: { key }, data: { name, desc, price, img, bg } })
    .catch(() => null);
  if (!flavor) return NextResponse.json({ error: "Sabor não encontrado." }, { status: 404 });
  return NextResponse.json(flavor);
}

export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  await prisma.heroFlavor.deleteMany({});
  await prisma.heroFlavor.createMany({ data: DEFAULT_HERO_FLAVORS });
  const flavors = await prisma.heroFlavor.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(flavors);
}
