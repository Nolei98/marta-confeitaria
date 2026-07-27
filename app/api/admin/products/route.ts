import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

function parseStock(raw: unknown): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { name, category, price, imageUrl, stock } = await req.json();
  if (!name?.trim() || !category?.trim() || price == null) {
    return NextResponse.json({ error: "Preencha nome, categoria e preço." }, { status: 400 });
  }
  const parsedStock = parseStock(stock);
  if (!parsedStock.ok) {
    return NextResponse.json({ error: "Estoque deve ser um número inteiro maior ou igual a zero." }, { status: 400 });
  }
  const product = await prisma.product.create({ data: { name, category, price, imageUrl, stock: parsedStock.value } });
  return NextResponse.json(product);
}
