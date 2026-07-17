import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[NextAuth] Missing credentials");
            return null;
          }

          // Support login by email OR username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email.toLowerCase().trim() },
                { username: credentials.email.toLowerCase().trim() },
              ],
            },
          });

          if (!user) {
            console.log("[NextAuth] User not found:", credentials.email);
            return null;
          }

          // Check if user is suspended/deactivated
          if (user.role === 'SUSPENDED') {
            console.log("[NextAuth] User account suspended:", credentials.email);
            throw new Error("Account suspended. Contact support.");
          }

          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) {
            console.log("[NextAuth] Invalid password for:", credentials.email);
            return null;
          }

          console.log("[NextAuth] Login success:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (err) {
          console.error("[NextAuth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
