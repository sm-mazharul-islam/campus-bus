"use server";

import { prisma } from "@/lib/db";

const mockNotifications = [
  {
    id: "notif-1-id",
    title: "Bus 12 Delayed by 10 Minutes",
    message: "Please note that Bus 12 is experiencing traffic delays near Choumatha. Scheduled arrival is delayed by approximately 10 minutes.",
    createdAt: new Date()
  },
  {
    id: "notif-2-id",
    title: "Semester Final Examination Special Schedule",
    message: "An extra trip has been added to Route A at 8:00 PM starting Sunday to accommodate semester final exams.",
    createdAt: new Date()
  }
];

export async function getNotifications() {
  try {
    return await prisma.notification.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (err) {
    console.error("Database getNotifications failed, using fallback:", err);
    return mockNotifications;
  }
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
