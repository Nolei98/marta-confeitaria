import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SALES_POINTS } from "@/lib/landingDefaults";

export const dynamic = "force-dynamic";

export async function GET() {
  const points = await prisma.salesPoint.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(points.length ? points : DEFAULT_SALES_POINTS);
}
