import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { DEFAULT_SALES_POINTS } from "@/lib/landingDefaults";

async function ensureSeeded() {
  const count = await prisma.salesPoint.count();
  if (count === 0) {
    await prisma.salesPoint.createMany({ data: DEFAULT_SALES_POINTS });
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  await ensureSeeded();
  const points = await prisma.salesPoint.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(points);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { name, address, lat, lng } = await req.json();
  if (!name?.trim() || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const count = await prisma.salesPoint.count();
  const point = await prisma.salesPoint.create({ data: { name, address: address ?? "", lat, lng, order: count } });
  return NextResponse.json(point, { status: 201 });
}
