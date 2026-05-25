"use server";

import { prisma } from "@/lib/db";

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    return { error: error.message };
  }
}
