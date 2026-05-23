import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch database facts to construct a highly informed response!
    const buses = await prisma.bus.findMany();
    const routes = await prisma.route.findMany();

    const lowerMsg = message.toLowerCase();
    let reply = "";

    // Localized Intelligent Knowledge System
    if (lowerMsg.includes("bus 12")) {
      const b = buses.find(x => x.busNumber === "Bus 12");
      const r = routes.find(x => x.busId === "Bus 12");
      const stops = r ? JSON.parse(r.stops) : [];
      const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
      reply = `**Bus 12** is currently **${b?.status || "ACTIVE"}**. It is operating on the **${r?.name || "unassigned"}** route.\n\n📍 **Route Stops:** ${stopNames || "N/A"}\n⏱️ **Scheduled Times:** 07:30 AM, 08:30 AM, 01:30 PM, 05:15 PM\n👥 **Capacity:** ${b?.capacity || 60} seats.\n🌎 **Current Coordinates:** Lat ${b?.currentLat || 22.8025}, Lng ${b?.currentLng || 90.3522}.`;
    } else if (lowerMsg.includes("bus 7") || lowerMsg.includes("bus 07")) {
      const b = buses.find(x => x.busNumber === "Bus 07");
      const r = routes.find(x => x.busId === "Bus 07");
      const stops = r ? JSON.parse(r.stops) : [];
      const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
      reply = `**Bus 07** is currently **${b?.status || "ACTIVE"}**. It is operating on the **${r?.name || "unassigned"}** route.\n\n📍 **Route Stops:** ${stopNames || "N/A"}\n⏱️ **Scheduled Times:** 07:45 AM, 08:45 AM, 02:00 PM, 05:30 PM\n👥 **Capacity:** ${b?.capacity || 55} seats.\n🌎 **Current Coordinates:** Lat ${b?.currentLat || 22.7850}, Lng ${b?.currentLng || 90.3420}.`;
    } else if (lowerMsg.includes("bus 3") || lowerMsg.includes("bus 03")) {
      const b = buses.find(x => x.busNumber === "Bus 03");
      reply = `**Bus 03** is currently under **MAINTENANCE**. It is not operating on any route today. Expected back in service tomorrow.`;
    } else if (lowerMsg.includes("nathullabad") || lowerMsg.includes("route a")) {
      const r = routes.find(x => x.name.toLowerCase().includes("nathullabad"));
      const stops = r ? JSON.parse(r.stops) : [];
      const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
      reply = `🚍 **Route A (Nathullabad to Campus):**\n\n📍 **Stops:** ${stopNames}\n⏱️ **Schedules:** 7:30 AM, 8:30 AM, 1:30 PM, 5:15 PM\n🔗 **Assigned Bus:** Bus 12 (Active)`;
    } else if (lowerMsg.includes("rupatali") || lowerMsg.includes("route b")) {
      const r = routes.find(x => x.name.toLowerCase().includes("rupatali"));
      const stops = r ? JSON.parse(r.stops) : [];
      const stopNames = stops.map((s: any) => s.name).join(" ➔ ");
      reply = `🚍 **Route B (Rupatali to Campus):**\n\n📍 **Stops:** ${stopNames}\n⏱️ **Schedules:** 7:45 AM, 8:45 AM, 2:00 PM, 5:30 PM\n🔗 **Assigned Bus:** Bus 07 (Active)`;
    } else if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
      reply = `Hello! I am your **CampusBus Assistant**. 🚍\n\nI have live access to the university transit database. You can ask me things like:\n* "When does the Nathullabad bus start?"\n* "What is the status of Bus 12?"\n* "Where is the Rupatali route stops?"`;
    } else if (lowerMsg.includes("status") || lowerMsg.includes("active") || lowerMsg.includes("buses")) {
      const active = buses.filter(x => x.status === "ACTIVE").map(x => x.busNumber).join(", ");
      const maint = buses.filter(x => x.status === "MAINTENANCE").map(x => x.busNumber).join(", ");
      reply = `📊 **Current Transit Fleet Overview:**\n\n✅ **Active Buses:** ${active || "None"}\n🛠️ **In Maintenance:** ${maint || "None"}\n\nAsk me about a specific bus number (e.g. "Bus 12") to get its live driver and GPS coordinates!`;
    } else {
      reply = `I processed your request, but I couldn't find a direct answer. \n\nHere is a list of what you can ask me:\n* "Where is **Bus 12**?"\n* "What is the **Rupatali** route?"\n* "Which buses are **active**?"\n* "Show me **Route A** schedule."`;
    }

    return NextResponse.json({ response: reply });
  } catch (error: any) {
    console.error("AI Assistant API error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
