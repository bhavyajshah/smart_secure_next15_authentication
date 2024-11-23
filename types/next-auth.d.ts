import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      subscription: string;
      emailVerified: boolean;
      devices: any[];
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    subscription: string;
    emailVerified: any;
    devices: any[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    subscription: string;
    emailVerified: any;
  }
}