import { auth } from "@/auth";

export async function requirePartner() {
  const session = await auth();
  if (session?.user?.role !== "PARTNER" && session?.user?.role !== "ADMIN") return null;
  return session;
}
