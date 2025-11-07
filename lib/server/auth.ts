import { getServerSession, NextAuthOptions, User } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { compare } from "bcrypt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
      user: {
          id: string;
          email: string;
          name: string;
          role: Role;
      };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXT_AUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.user.findFirst({
          where: { email: credentials.email },
        });
        if (!user || !user?.password) {
          return null;
        }
        const verified = await compare(credentials.password, user.password);
        if (!verified) {
          return null;
        }
        return {
          id: user.id,
          name: user.name + "@" + user.role,
          email: user.email,
        };
      },
    })
  ],
  callbacks: {
    async jwt({ token , user}) {
      if (user) {
        return {
          ...token,
          id:user.id,
          username: user.name,
        };
      }
      return token;
    },
    async session({ session, token,user }) {
      const [name, role] = (token?.name || "").split("@");
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token?.id,
            name: name,
            role: role,
          },
        };
      }
      return session;
    },
  },
};


export async function getServerUser(){
  return getServerSession(authOptions)
}