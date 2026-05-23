"use server";

import { prisma } from "@/lib/db";

export async function getNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createNotification(title: string, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: { title, message }
    });
    return { success: true, notification };
  } catch (error: any) {
    return { error: error.message };
  }
}
