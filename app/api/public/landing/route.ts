import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HERO_FLAVORS, DEFAULT_SECTIONS } from "@/lib/landingDefaults";

export const dynamic = "force-dynamic";

export async function GET() {
  const [flavors, sections] = await Promise.all([
    prisma.heroFlavor.findMany({ orderBy: { order: "asc" } }),
    prisma.siteSection.findMany(),
  ]);

  const sectionMap: Record<string, boolean> = {};
  for (const s of DEFAULT_SECTIONS) sectionMap[s.key] = s.enabled;
  for (const s of sections) sectionMap[s.key] = s.enabled;

  return NextResponse.json({
    heroFlavors: flavors.length ? flavors : DEFAULT_HERO_FLAVORS,
    sections: sectionMap,
  });
}
