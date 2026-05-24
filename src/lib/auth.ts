import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      studentId?: string | null;
      busNumber?: string | null;
      department?: string | null;
      batch?: string | null;
      phone?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId?: string | null;
    busNumber?: string | null;
    department?: string | null;
    batch?: string | null;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    studentId?: string | null;
    busNumber?: string | null;
    department?: string | null;
    batch?: string | null;
    phone?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            busNumber: user.busNumber,
            department: user.department,
            batch: user.batch,
            phone: user.phone,
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studentId = user.studentId;
        token.busNumber = user.busNumber;
        token.department = user.department;
        token.batch = user.batch;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.studentId = token.studentId;
        session.user.busNumber = token.busNumber;
        session.user.department = token.department;
        session.user.batch = token.batch;
        session.user.phone = token.phone;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
