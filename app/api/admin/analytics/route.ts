import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const DAYS = 30;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [orders, userCount, productCount] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  // Revenue + order count per day, last 30 days (zero-filled).
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(dayKey(d), { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = dayKey(o.createdAt);
    const entry = byDay.get(key);
    if (entry) {
      entry.revenue += Number(o.total);
      entry.orders += 1;
    }
  }
  const revenueByDay = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));

  // Orders by status.
  const statusCounts: Record<string, number> = { PENDENTE: 0, EM_PREPARO: 0, PRONTO: 0, ENTREGUE: 0 };
  for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

  // Top products by quantity sold.
  const productSales = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const entry = productSales.get(it.nameSnapshot) ?? { qty: 0, revenue: 0 };
      entry.qty += it.qty;
      entry.revenue += Number(it.priceSnapshot) * it.qty;
      productSales.set(it.nameSnapshot, entry);
    }
  }
  const topProducts = Array.from(productSales.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    avgTicket,
    userCount,
    productCount,
    revenueByDay,
    statusCounts,
    topProducts,
  });
}
