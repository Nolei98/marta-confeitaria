import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/verificationToken";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const redirectTo = new URL("/conta", url);

  if (!token) {
    redirectTo.searchParams.set("verify", "error");
    return NextResponse.redirect(redirectTo);
  }

  const record = await consumeToken(token, "EMAIL_VERIFY");
  if (!record) {
    redirectTo.searchParams.set("verify", "error");
    return NextResponse.redirect(redirectTo);
  }

  await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } });
  redirectTo.searchParams.set("verify", "success");
  return NextResponse.redirect(redirectTo);
}
