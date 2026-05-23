"use server";

import { prisma } from "@/lib/db";

export async function getBuses() {
  return prisma.bus.findMany({
    orderBy: { busNumber: "asc" }
  });
}

export async function getActiveBuses() {
  return prisma.bus.findMany({
    where: { status: "ACTIVE" }
  });
}

export async function updateBusLocation(busNumber: string, lat: number, lng: number) {
  try {
    const updatedBus = await prisma.bus.update({
      where: { busNumber },
      data: { currentLat: lat, currentLng: lng }
    });

    // Optional Pusher integration
    if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.PUSHER_SECRET) {
      try {
        const Pusher = require("pusher");
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.NEXT_PUBLIC_PUSHER_KEY,
          secret: process.env.PUSHER_SECRET,
          cluster: process.env.PUSHER_CLUSTER || "ap1",
          useTLS: true
        });
        await pusher.trigger(`bus-${busNumber}`, "location-update", { lat, lng });
      } catch (pusherErr: any) {
        console.warn("Pusher broadcast failed:", pusherErr.message);
      }
    }

    return { success: true, bus: updatedBus };
  } catch (error: any) {
    console.error("Location update failed:", error);
    return { error: error.message };
  }
}

export async function createBus(data: { busNumber: string; capacity: number; status: string }) {
  try {
    const bus = await prisma.bus.create({ data });
    return { success: true, bus };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateBus(busNumber: string, data: { capacity?: number; status?: string; driverId?: string | null; driverName?: string | null }) {
  try {
    const bus = await prisma.bus.update({
      where: { busNumber },
      data
    });
    return { success: true, bus };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBus(busNumber: string) {
  try {
    await prisma.bus.delete({ where: { busNumber } });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
