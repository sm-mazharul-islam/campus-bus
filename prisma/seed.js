const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up old database records...");
  await prisma.user.deleteMany({});
  await prisma.bus.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.boardingRecord.deleteMany({});

  console.log("Seeding default Users...");
  
  // Seed Admin
  await prisma.user.create({
    data: {
      email: "admin@campusbus.com",
      password: "admin123", // Plaintxt or simple auth for local developer login
      name: "Professor Mahmudul Hasan",
      role: "ADMIN",
      studentId: "ADM-999",
      department: "Administration",
      phone: "+8801999999999",
    }
  });

  // Seed Drivers
  const driver1 = await prisma.user.create({
    data: {
      email: "driver1@campusbus.com",
      password: "driver123",
      name: "Abul Kalam",
      role: "DRIVER",
      studentId: "D-101",
      department: "Transport Section",
      busNumber: "Bus 12",
      phone: "+8801711111111",
    }
  });

  const driver2 = await prisma.user.create({
    data: {
      email: "driver2@campusbus.com",
      password: "driver123",
      name: "Mofizur Rahman",
      role: "DRIVER",
      studentId: "D-102",
      department: "Transport Section",
      busNumber: "Bus 07",
      phone: "+8801822222222",
    }
  });

  const driver3 = await prisma.user.create({
    data: {
      email: "driver3@campusbus.com",
      password: "driver123",
      name: "Solaiman Khan",
      role: "DRIVER",
      studentId: "D-103",
      department: "Transport Section",
      busNumber: "Bus 99",
      phone: "+8801933333333",
    }
  });

  // Seed Students
  await prisma.user.create({
    data: {
      email: "student@campusbus.com",
      password: "student123",
      name: "Sadia Islam",
      role: "STUDENT",
      studentId: "112233445566",
      department: "CSE",
      batch: "11th",
      busNumber: "Bus 12",
      phone: "+8801733333333",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    }
  });

  await prisma.user.create({
    data: {
      email: "rahim@campusbus.com",
      password: "student123",
      name: "Rahim Ahmed",
      role: "STUDENT",
      studentId: "223344556677",
      department: "BBA",
      batch: "12th",
      busNumber: "Bus 07",
      phone: "+8801844444444",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    }
  });

  console.log("Seeding default Buses...");
  await prisma.bus.create({
    data: {
      busNumber: "Bus 12",
      driverId: driver1.id,
      driverName: driver1.name,
      capacity: 60,
      status: "ACTIVE",
      currentLat: 22.8025,
      currentLng: 90.3522,
    }
  });

  await prisma.bus.create({
    data: {
      busNumber: "Bus 07",
      driverId: driver2.id,
      driverName: driver2.name,
      capacity: 55,
      status: "ACTIVE",
      currentLat: 22.7850,
      currentLng: 90.3420,
    }
  });

  await prisma.bus.create({
    data: {
      busNumber: "Bus 99",
      driverId: driver3.id,
      driverName: driver3.name,
      capacity: 40,
      status: "ACTIVE",
      currentLat: 23.7252,
      currentLng: 90.4124,
    }
  });

  await prisma.bus.create({
    data: {
      busNumber: "Bus 03",
      capacity: 50,
      status: "MAINTENANCE",
      currentLat: 22.8100,
      currentLng: 90.3600,
    }
  });

  console.log("Seeding default Routes...");
  await prisma.route.create({
    data: {
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
    }
  });

  await prisma.route.create({
    data: {
      name: "Rupatali to University Campus",
      stops: JSON.stringify([
        { name: "Rupatali Terminal", lat: 22.6784, lng: 90.3481, order: 1 },
        { name: "Sagardi Bridge", lat: 22.6890, lng: 90.3520, order: 2 },
        { name: "University Main Gate", lat: 22.8025, lng: 90.3522, order: 3 }
      ]),
      schedules: JSON.stringify(["7:45 AM", "8:45 AM", "2:00 PM", "5:30 PM"]),
      busId: "Bus 07"
    }
  });

  await prisma.route.create({
    data: {
      name: "Dhaka Test Route (Gulistan to Science Lab)",
      stops: JSON.stringify([
        { name: "Gulistan Terminal", lat: 23.7252, lng: 90.4124, order: 1 },
        { name: "Shahbagh Intersection", lat: 23.7388, lng: 90.3965, order: 2 },
        { name: "Science Lab Crossing", lat: 23.7374, lng: 90.3802, order: 3 }
      ]),
      schedules: JSON.stringify(["8:00 AM", "10:00 AM", "2:00 PM", "6:00 PM"]),
      busId: "Bus 99"
    }
  });

  console.log("Seeding default Notifications...");
  await prisma.notification.create({
    data: {
      title: "Bus 12 Delayed by 10 Minutes",
      message: "Please note that Bus 12 is experiencing traffic delays near Choumatha. Scheduled arrival is delayed by approximately 10 minutes.",
    }
  });

  await prisma.notification.create({
    data: {
      title: "Semester Final Examination Special Schedule",
      message: "An extra trip has been added to Route A at 8:00 PM starting Sunday to accommodate semester final exams.",
    }
  });

  console.log("Seeding default Boarding Records...");
  const records = [
    { studentId: "112233445566", studentName: "Sadia Islam", busNumber: "Bus 12" },
    { studentId: "223344556677", studentName: "Rahim Ahmed", busNumber: "Bus 07" },
    { studentId: "102030405060", studentName: "Tareq Jamil", busNumber: "Bus 12" },
    { studentId: "203040506070", studentName: "Rina Begum", busNumber: "Bus 12" },
    { studentId: "304050607080", studentName: "Jamil Hossain", busNumber: "Bus 07" }
  ];

  for (const r of records) {
    await prisma.boardingRecord.create({ data: r });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  });
