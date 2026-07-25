import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "PARTNER" | "ADMIN";
      emailConfirmed: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "PARTNER" | "ADMIN";
    emailConfirmed?: boolean;
  }
}
