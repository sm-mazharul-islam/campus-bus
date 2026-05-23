"use server";

import { prisma } from "@/lib/db";

export async function getBoardingRecords() {
  return prisma.boardingRecord.findMany({
    orderBy: { timestamp: "desc" }
  });
}

export async function recordBoarding(studentId: string, busNumber: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { studentId }
    });

    if (!student) {
      return { error: "Student not found with this ID" };
    }

    const record = await prisma.boardingRecord.create({
      data: {
        studentId,
        studentName: student.name,
        busNumber,
      }
    });

    return { success: true, record };
  } catch (error: any) {
    return { error: error.message };
  }
}
