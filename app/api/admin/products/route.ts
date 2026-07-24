import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { name, category, price, imageUrl } = await req.json();
  if (!name?.trim() || !category?.trim() || price == null) {
    return NextResponse.json({ error: "Preencha nome, categoria e preço." }, { status: 400 });
  }
  const product = await prisma.product.create({ data: { name, category, price, imageUrl } });
  return NextResponse.json(product);
}
