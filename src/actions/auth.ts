"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

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

    // Set cookie session (simple JSON for mock ease-of-use and speed)
    const sessionData: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department,
      batch: user.batch,
      phone: user.phone,
      busNumber: user.busNumber,
      profileImage: user.profileImage,
    };

    const cookieStore = await cookies();
    cookieStore.set("campusbus_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
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

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a real production app we would hash the password (e.g. bcrypt)
        role,
        studentId: studentId || null,
        department: department || null,
        batch: batch || null,
        phone: phone || null,
        busNumber: busNumber || null,
      },
    });

    // Automatically log user in
    const sessionData: UserSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
      department: newUser.department,
      batch: newUser.batch,
      phone: newUser.phone,
      busNumber: newUser.busNumber,
      profileImage: newUser.profileImage,
    };

    const cookieStore = await cookies();
    cookieStore.set("campusbus_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, role: newUser.role };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("campusbus_session");
  return { success: true };
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("campusbus_session");

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch (e) {
    return null;
  }
}
