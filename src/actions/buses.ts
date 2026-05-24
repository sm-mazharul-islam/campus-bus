"use server";

import { prisma } from "@/lib/db";

const mockBuses = [
  {
    id: "bus-12-id",
    busNumber: "Bus 12",
    driverId: "driver-1-id",
    driverName: "Abul Kalam",
    capacity: 60,
    status: "ACTIVE",
    currentLat: 22.8025,
    currentLng: 90.3522,
    updatedAt: new Date()
  },
  {
    id: "bus-07-id",
    busNumber: "Bus 07",
    driverId: "driver-2-id",
    driverName: "Mofizur Rahman",
    capacity: 55,
    status: "ACTIVE",
    currentLat: 22.7850,
    currentLng: 90.3420,
    updatedAt: new Date()
  },
  {
    id: "bus-99-id",
    busNumber: "Bus 99",
    driverId: "driver-3-id",
    driverName: "Solaiman Khan",
    capacity: 40,
    status: "ACTIVE",
    currentLat: 23.7252,
    currentLng: 90.4124,
    updatedAt: new Date()
  },
  {
    id: "bus-03-id",
    busNumber: "Bus 03",
    driverId: null,
    driverName: null,
    capacity: 50,
    status: "MAINTENANCE",
    currentLat: 22.8100,
    currentLng: 90.3600,
    updatedAt: new Date()
  }
];

export async function getBuses() {
  try {
    return await prisma.bus.findMany({
      orderBy: { busNumber: "asc" }
    });
  } catch (err) {
    console.error("Database getBuses failed, using fallback:", err);
    return mockBuses;
  }
}

export async function getActiveBuses() {
  try {
    return await prisma.bus.findMany({
      where: { status: "ACTIVE" }
    });
  } catch (err) {
    console.error("Database getActiveBuses failed, using fallback:", err);
    return mockBuses.filter(b => b.status === "ACTIVE");
  }
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
