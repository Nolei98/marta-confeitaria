import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { authConfig } from "./auth.config";
import { isRateLimited, recordAttempt, clearAttempts, clientIp } from "@/lib/rateLimit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const key = `login:${email.toLowerCase()}`;
        const ipKey = `login-ip:${clientIp(request)}`;
        if ((await isRateLimited(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) || (await isRateLimited(ipKey, LOGIN_MAX_ATTEMPTS * 3, LOGIN_WINDOW_MS))) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          await recordAttempt(key, LOGIN_WINDOW_MS);
          await recordAttempt(ipKey, LOGIN_WINDOW_MS);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await recordAttempt(key, LOGIN_WINDOW_MS);
          await recordAttempt(ipKey, LOGIN_WINDOW_MS);
          return null;
        }

        await clearAttempts(key);
        await logActivity(user.id, "LOGIN");
        return { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: !!user.emailVerified };
      },
    }),
  ],
});
