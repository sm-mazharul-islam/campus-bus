import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch database facts to construct a highly informed, real-time response!
    const buses = await prisma.bus.findMany();
    const routes = await prisma.route.findMany();

    const lowerMsg = message.toLowerCase();
    let reply = "";

    // 1. Dynamic Database Lookup
    let matchedBus = null;
    let matchedRoute = null;

    // Search for mentioned buses (e.g., "Bus 12", "Bus 99", "Bus 07")
    for (const b of buses) {
      if (lowerMsg.includes(b.busNumber.toLowerCase())) {
        matchedBus = b;
        matchedRoute = routes.find((x) => x.busId === b.busNumber);
        break;
      }
    }

    // Search for mentioned routes (e.g., "Dhaka", "Nathullabad", "Rupatali")
    for (const r of routes) {
      if (
        lowerMsg.includes(r.name.toLowerCase()) ||
        (r.busId && lowerMsg.includes(r.busId.toLowerCase()))
      ) {
        matchedRoute = r;
        matchedBus = buses.find((x) => x.busNumber === r.busId);
        break;
      }
    }

    // 2. Localized Intelligent Knowledge System Response Builder
    if (matchedBus) {
      const status = matchedBus.status;
      if (status === "MAINTENANCE") {
        reply = `🛠️ **${matchedBus.busNumber}** is currently under **MAINTENANCE**. It is not operating on any route today. Expected back in service soon.`;
      } else {
        const rName = matchedRoute ? matchedRoute.name : "Unassigned Route";
        const stops = matchedRoute ? JSON.parse(matchedRoute.stops) : [];
        const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
        const schedules = matchedRoute
          ? JSON.parse(matchedRoute.schedules).join(", ")
          : "N/A";

        reply = `🚍 **${matchedBus.busNumber}** is currently **${status}**.\n\n🛣️ **Route**: ${rName}\n📍 **Stops**: ${stopNames || "N/A"}\n⏱️ **Schedules**: ${schedules}\n👤 **Driver**: ${matchedBus.driverName || "N/A"}\n🌎 **Coordinates**: Lat ${matchedBus.currentLat}, Lng ${matchedBus.currentLng}.`;
      }
    } else if (matchedRoute) {
      const stops = JSON.parse(matchedRoute.stops);
      const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
      const schedules = JSON.parse(matchedRoute.schedules).join(", ");
      const busText = matchedRoute.busId ? `${matchedRoute.busId} (Active)` : "None";

      reply = `🛣️ **Route: ${matchedRoute.name}**\n\n📍 **Stops**: ${stopNames}\n⏱️ **Schedules**: ${schedules}\n🔗 **Assigned Fleet**: ${busText}`;
    } else if (
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hey")
    ) {
      reply = `Hello! I am your **CampusBus Assistant**. 🚍\n\nI have live access to the university transit database. You can ask me things like:\n* "When does the Dhaka Test Route bus start?"\n* "What is the status of Bus 99?"\n* "Where is the Rupatali route stops?"`;
    } else if (
      lowerMsg.includes("status") ||
      lowerMsg.includes("active") ||
      lowerMsg.includes("buses") ||
      lowerMsg.includes("fleet")
    ) {
      const active = buses
        .filter((x) => x.status === "ACTIVE")
        .map((x) => x.busNumber)
        .join(", ");
      const maint = buses
        .filter((x) => x.status === "MAINTENANCE")
        .map((x) => x.busNumber)
        .join(", ");
      reply = `📊 **Current Transit Fleet Overview:**\n\n✅ **Active Buses:** ${active || "None"}\n🛠️ **In Maintenance:** ${maint || "None"}\n\nAsk me about a specific bus number (e.g. "Bus 99" or "Bus 12") to get its live driver, route, and GPS coordinates!`;
    } else {
      reply = `I processed your request, but I couldn't find a direct answer.\n\nHere is a list of what you can ask me:\n* "Where is **Bus 99**?"\n* "What is the status of **Bus 12**?"\n* "Which buses are **active**?"\n* "Show me **Dhaka Test Route** details."`;
    }

    return NextResponse.json({ response: reply });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
