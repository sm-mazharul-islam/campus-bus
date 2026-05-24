"use server";

import { prisma } from "@/lib/db";

const mockRoutes = [
  {
    id: "route-1-id",
    name: "Nathullabad to University Campus",
    stops: JSON.stringify([
      { name: "Nathullabad Bus Terminal", lat: 22.7161, lng: 90.3496, order: 1 },
      { name: "C&B Road Crossing", lat: 22.7052, lng: 90.3414, order: 2 },
      { name: "Choumatha Circle", lat: 22.6958, lng: 90.3382, order: 3 },
      { name: "Rupatali Junction", lat: 22.6784, lng: 90.3481, order: 4 },
      { name: "University Main Gate", lat: 22.8025, lng: 90.3522, order: 5 },
    ]),
    schedules: JSON.stringify(["7:30 AM", "8:30 AM", "1:30 PM", "5:15 PM"]),
    busId: "Bus 12"
  },
  {
    id: "route-2-id",
    name: "Rupatali to University Campus",
    stops: JSON.stringify([
      { name: "Rupatali Terminal", lat: 22.6784, lng: 90.3481, order: 1 },
      { name: "Sagardi Bridge", lat: 22.6890, lng: 90.3520, order: 2 },
      { name: "University Main Gate", lat: 22.8025, lng: 90.3522, order: 3 }
    ]),
    schedules: JSON.stringify(["7:45 AM", "8:45 AM", "2:00 PM", "5:30 PM"]),
    busId: "Bus 07"
  },
  {
    id: "route-3-id",
    name: "Dhaka Test Route (Gulistan to Science Lab)",
    stops: JSON.stringify([
      { name: "Gulistan Terminal", lat: 23.7252, lng: 90.4124, order: 1 },
      { name: "Shahbagh Intersection", lat: 23.7388, lng: 90.3965, order: 2 },
      { name: "Science Lab Crossing", lat: 23.7374, lng: 90.3802, order: 3 }
    ]),
    schedules: JSON.stringify(["8:00 AM", "10:00 AM", "2:00 PM", "6:00 PM"]),
    busId: "Bus 99"
  }
];

export async function getRoutes() {
  try {
    return await prisma.route.findMany({});
  } catch (err) {
    console.error("Database getRoutes failed, using fallback:", err);
    return mockRoutes;
  }
}

export async function createRoute(data: { name: string; stops: string; schedules: string; busId?: string }) {
  try {
    const route = await prisma.route.create({ data });
    return { success: true, route };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateRoute(id: string, data: { name?: string; stops?: string; schedules?: string; busId?: string | null }) {
  try {
    const route = await prisma.route.update({
      where: { id },
      data
    });
    return { success: true, route };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteRoute(id: string) {
  try {
    await prisma.route.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
