"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Bus,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Activity,
  Plus,
  Trash2,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getBuses, createBus, updateBus, deleteBus } from "@/actions/buses";
import { getRoutes, createRoute, updateRoute, deleteRoute } from "@/actions/routes";
import { createNotification } from "@/actions/notifications";
import { signOut } from "next-auth/react";
import BusMap from "../map/bus-map";

interface AdminDashboardProps {
  user: {
    name: string;
    studentId?: string | null;
    department?: string | null;
  };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "buses" | "routes" | "notifications">("overview");
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Bus form states
  const [newBusNumber, setNewBusNumber] = useState("");
  const [newBusCapacity, setNewBusCapacity] = useState(50);
  const [newBusStatus, setNewBusStatus] = useState("ACTIVE");

  // Route form states
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteSchedules, setNewRouteSchedules] = useState("7:30 AM, 1:30 PM");
  const [newRouteStops, setNewRouteStops] = useState<Array<{ name: string; lat: number; lng: number; order: number }>>([]);
  const [assignedBusNumber, setAssignedBusNumber] = useState("");

  // Notification form states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Poll database state
  useEffect(() => {
    async function fetchData() {
      try {
        const busData = await getBuses();
        setBuses(busData);

        const routeData = await getRoutes();
        setRoutes(routeData);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber.trim()) return;

    const res = await createBus({
      busNumber: newBusNumber,
      capacity: newBusCapacity,
      status: newBusStatus,
    });

    if (res.success) {
      setBuses((prev) => [...prev, res.bus]);
      setNewBusNumber("");
      setNewBusCapacity(50);
      alert("Bus created successfully!");
    } else {
      alert(`Error creating bus: ${res.error}`);
    }
  };

  const handleDeleteBus = async (busNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${busNumber}?`)) return;
    const res = await deleteBus(busNumber);
    if (res.success) {
      setBuses((prev) => prev.filter((b) => b.busNumber !== busNumber));
    }
  };

  const handleUpdateBusStatus = async (busNumber: string, status: string) => {
    const res = await updateBus(busNumber, { status });
    if (res.success) {
      setBuses((prev) =>
        prev.map((b) => (b.busNumber === busNumber ? { ...b, status } : b))
      );
    }
  };

  const handleAddStopOnMapClick = (stop: { name: string; lat: number; lng: number }) => {
    setNewRouteStops((prev) => [
      ...prev,
      { ...stop, order: prev.length + 1 },
    ]);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim() || newRouteStops.length === 0) {
      alert("Please enter a route name and add at least one stop on the map!");
      return;
    }

    const schedulesArr = newRouteSchedules.split(",").map((s) => s.trim());
    const res = await createRoute({
      name: newRouteName,
      stops: JSON.stringify(newRouteStops),
      schedules: JSON.stringify(schedulesArr),
      busId: assignedBusNumber || undefined,
    });

    if (res.success) {
      setRoutes((prev) => [...prev, res.route]);
      setNewRouteName("");
      setNewRouteStops([]);
      setAssignedBusNumber("");
      alert("Route created successfully!");
    } else {
      alert(`Error creating route: ${res.error}`);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    const res = await deleteRoute(id);
    if (res.success) {
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const res = await createNotification(notifTitle, notifMessage);
    if (res.success && res.notification) {
      try {
        const channel = new BroadcastChannel("campusbus_realtime");
        channel.postMessage({ type: "notification", data: res.notification });
        channel.close();
      } catch (err) {
        console.warn("BroadcastChannel postMessage failed:", err);
      }
      setNotifTitle("");
      setNotifMessage("");
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 4000);
    } else {
      alert("Failed to send notification.");
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Recharts Chart Data Processing
  const activeBusesCount = buses.filter((b) => b.status === "ACTIVE").length;
  const maintenanceCount = buses.filter((b) => b.status === "MAINTENANCE").length;
  const inactiveBusesCount = buses.filter((b) => b.status === "INACTIVE").length;

  const totalStopsCount = routes.reduce((acc, r) => acc + JSON.parse(r.stops).length, 0);

  const fleetStatusData = [
    { name: "Active", count: activeBusesCount },
    { name: "Inactive", count: inactiveBusesCount },
    { name: "Maintenance", count: maintenanceCount }
  ];

  const routeStopsData = routes.map(r => ({
    name: r.name.split(" to ")[0] || r.name,
    stops: JSON.parse(r.stops).length
  }));

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans">
      {/* Header bar */}
      <header className="glass-panel border-b border-[#D4AF37]/15 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#003087] p-2 rounded-xl border border-[#D4AF37]/30 shadow-lg animate-pulse-glow">
            <Compass className="h-6 w-6 text-[#D4AF37] animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              CampusBus <span className="text-xs text-[#D4AF37] px-2 py-0.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20">Administrator</span>
            </h1>
            <p className="text-[10px] text-slate-400">Bangladesh University</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <span className="text-[10px] text-[#D4AF37]">Campus Transport Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all duration-300"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Statistics Overview Widget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none" />
            <div className="p-3 bg-[#003087] border border-[#D4AF37]/30 rounded-xl">
              <Bus className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Total Transit Fleet</span>
              <span className="text-2xl font-extrabold text-white">{buses.length} Buses</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Active Fleet</span>
              <span className="text-2xl font-extrabold text-white">{activeBusesCount} Operating</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Maintenance Fleet</span>
              <span className="text-2xl font-extrabold text-white">{maintenanceCount} Buses</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Total Active Stop Nodes</span>
              <span className="text-2xl font-extrabold text-white">{totalStopsCount} Stops</span>
            </div>
          </div>
        </div>

        {/* Sub-tabs menu */}
        <div className="flex gap-2 border-b border-white/5 pb-2">
          {(["overview", "buses", "routes", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeSubTab === tab
                  ? "bg-[#003087] text-white border border-[#D4AF37]/35 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "overview" ? "Analytics Overview" : tab}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 flex flex-col gap-6">
          {activeSubTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fleet Status Distribution Bar Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-[#D4AF37]" />
                  <span>Fleet Status Distribution</span>
                </h3>
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fleetStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Route Stops Distribution Line Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-blue-400" />
                  <span>Route Stops Densities</span>
                </h3>
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={routeStopsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="stops" stroke="#003087" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "buses" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bus list table */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="font-bold text-white text-base">Fleet Inventory Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-semibold">
                        <th className="pb-3 pr-2">Bus Code</th>
                        <th className="pb-3 pr-2">Capacity</th>
                        <th className="pb-3 pr-2">Assigned Driver</th>
                        <th className="pb-3 pr-2">Status</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buses.map((bus) => (
                        <tr key={bus.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pr-2 font-bold text-white flex items-center">
                            <span>{bus.busNumber}</span>
                            {bus.status === "ACTIVE" && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${bus.currentLat},${bus.currentLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 font-bold hover:underline ml-3 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                              >
                                🌎 Live GPS
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 pr-2 text-slate-300">{bus.capacity} seats</td>
                          <td className="py-3.5 pr-2 text-slate-400">{bus.driverName || "None"}</td>
                          <td className="py-3.5 pr-2">
                            <select
                              value={bus.status}
                              onChange={(e) => handleUpdateBusStatus(bus.busNumber, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                              <option value="MAINTENANCE">MAINTENANCE</option>
                            </select>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <button
                              onClick={() => handleDeleteBus(bus.busNumber)}
                              className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Bus form */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="font-bold text-white text-base">Add New Bus</h3>
                <form onSubmit={handleCreateBus} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bus Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Bus 15"
                      value={newBusNumber}
                      onChange={(e) => setNewBusNumber(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#D4AF37]/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Max Capacity</label>
                    <input
                      type="number"
                      value={newBusCapacity}
                      onChange={(e) => setNewBusCapacity(parseInt(e.target.value))}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Initial Status</label>
                    <select
                      value={newBusStatus}
                      onChange={(e) => setNewBusStatus(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/35 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-md flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4 text-[#D4AF37]" />
                    <span>Create Fleet Unit</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSubTab === "routes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stops Builder / Click Map */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-[#D4AF37]" />
                  <span>
                    <strong>Interactive Stop Planner:</strong> Tap anywhere on the live canvas map below to automatically generate scheduled stops!
                  </span>
                </div>
                <BusMap
                  buses={buses}
                  routes={routes}
                  interactive={true}
                  onAddStop={handleAddStopOnMapClick}
                />
              </div>

              {/* Save Route Form */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="font-bold text-white text-base">Route stop builder</h3>
                
                <form onSubmit={handleCreateRoute} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Route Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Choumatha to Campus"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Schedules (separated by comma)</label>
                    <input
                      type="text"
                      value={newRouteSchedules}
                      onChange={(e) => setNewRouteSchedules(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Link to Bus</label>
                    <select
                      value={assignedBusNumber}
                      onChange={(e) => setAssignedBusNumber(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">Choose an available bus...</option>
                      {buses
                        .filter((b) => b.status === "ACTIVE")
                        .map((b) => (
                          <option key={b.id} value={b.busNumber}>
                            {b.busNumber}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Added Stops list */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Stops added: {newRouteStops.length}</span>
                    <div className="max-h-[120px] overflow-y-auto bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1.5 text-[11px]">
                      {newRouteStops.map((stop, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span>{stop.name}</span>
                          <span className="font-mono text-[9px] text-[#D4AF37]">
                            Lat: {stop.lat}, Lng: {stop.lng}
                          </span>
                        </div>
                      ))}
                      {newRouteStops.length === 0 && (
                        <span className="text-slate-600 italic">No stops added. Tap map coordinate to add.</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/35 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-300"
                  >
                    Save Custom Transit Route
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeSubTab === "notifications" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/5 max-w-xl mx-auto w-full flex flex-col gap-5">
              <div>
                <h3 className="font-bold text-white text-base">Broadcast System Alert</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Send a real-time schedule notification alert to all students</p>
              </div>

              <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Alert Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule Delay Alert"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Alert Details</label>
                  <textarea
                    placeholder="e.g. Please be informed that Bus 12 is delayed near Sagardi crossing..."
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/35 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Bell className="h-4 w-4 text-[#D4AF37]" />
                  <span>Broadcast FCM Announcement</span>
                </button>
              </form>

              {notifSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Success! Alert has been pushed to the Notification Center.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
