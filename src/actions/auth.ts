"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string | null;
  department?: string | null;
  batch?: string | null;
  phone?: string | null;
  busNumber?: string | null;
  profileImage?: string | null;
}

export async function loginUser(formData: FormData) {
  // Retained as a thin backward-compatible shell, actual logins utilize client-side next-auth signIn
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter all fields" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return { error: "Invalid email or password" };
    }

    return { success: true, role: user.role };
  } catch (error: any) {
    return { error: "An unexpected error occurred." };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  studentId?: string;
  department?: string;
  batch?: string;
  phone?: string;
  busNumber?: string;
}) {
  const { name, email, password, role, studentId, department, batch, phone, busNumber } = data;

  if (!name || !email || !password || !role) {
    return { error: "Please fill in all required fields" };
  }

  try {
    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return { error: "Email is already registered" };
    }

    // Check if Student ID is unique (if provided)
    if (studentId) {
      const existingUserById = await prisma.user.findUnique({
        where: { studentId },
      });

      if (existingUserById) {
        return { error: "Student ID is already registered" };
      }
    }

    // Create user in SQLite
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        studentId: studentId || null,
        department: department || null,
        batch: batch || null,
        phone: phone || null,
        busNumber: busNumber || null,
      },
    });

    return { success: true, role: newUser.role };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutUser() {
  // Retained as a thin backward-compatible adapter. Actual signouts trigger client signOut()
  return { success: true };
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return null;
    }
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      studentId: session.user.studentId,
      department: session.user.department,
      batch: session.user.batch,
      phone: session.user.phone,
      busNumber: session.user.busNumber,
    };
  } catch (e) {
    console.error("Failed to get NextAuth session:", e);
    return null;
  }
}
