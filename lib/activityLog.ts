import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export function logActivity(userId: string, action: string, meta?: Prisma.InputJsonValue) {
  return prisma.activityLog.create({ data: { userId, action, meta } });
}
