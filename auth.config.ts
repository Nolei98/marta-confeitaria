import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by middleware and the full auth.ts. Keep this file
// free of Node-only imports (Prisma, bcrypt) — middleware runs on the Edge
// runtime and can't bundle them.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/conta" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "CUSTOMER" | "PARTNER" | "ADMIN" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "CUSTOMER" | "PARTNER" | "ADMIN") ?? "CUSTOMER";
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
