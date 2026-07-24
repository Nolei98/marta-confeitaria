import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { DEFAULT_SECTIONS } from "@/lib/landingDefaults";

async function ensureSeeded() {
  const count = await prisma.siteSection.count();
  if (count === 0) {
    await prisma.siteSection.createMany({ data: DEFAULT_SECTIONS });
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  await ensureSeeded();
  const sections = await prisma.siteSection.findMany();
  return NextResponse.json(sections);
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { key, enabled } = await req.json();
  if (!key || typeof enabled !== "boolean") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const section = await prisma.siteSection.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });
  return NextResponse.json(section);
}
