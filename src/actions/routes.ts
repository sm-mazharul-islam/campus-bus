"use server";

import { prisma } from "@/lib/db";

export async function getRoutes() {
  return prisma.route.findMany({});
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
