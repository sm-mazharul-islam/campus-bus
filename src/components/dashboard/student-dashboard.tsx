"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Clock,
  Bell,
  MessageSquare,
  Send,
  Star,
  User,
  LogOut,
  Navigation,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";
import BusMap from "../map/bus-map";
import { getBuses } from "@/actions/buses";
import { getRoutes } from "@/actions/routes";
import { getNotifications } from "@/actions/notifications";
import { signOut } from "next-auth/react";

interface StudentDashboardProps {
  user: {
    name: string;
    studentId?: string | null;
    department?: string | null;
    batch?: string | null;
    busNumber?: string | null;
    phone?: string | null;
  };
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"track" | "ai-chat" | "notifications">("track");
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedBusNumber, setSelectedBusNumber] = useState<string | null>(user.busNumber || null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your CampusBus assistant. Ask me anything about bus schedules, stops, or active statuses." },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Poll database every 3 seconds to show live moving coordinates from drivers!
  useEffect(() => {
    async function fetchData() {
      try {
        const busData = await getBuses();
        setBuses(busData);
        
        const routeData = await getRoutes();
        setRoutes(routeData);

        const notifData = await getNotifications();
        setNotifications(notifData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const [activeToast, setActiveToast] = useState<{ title: string; message: string } | null>(null);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playChime = (time: number, freq: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = audioCtx.currentTime;
      playChime(now, 587.33, 0.15); // D5
      playChime(now + 0.12, 880.00, 0.3); // A5
    } catch (e) {
      console.warn("Chime failed:", e);
    }
  };

  // Real-time Event simulation using BroadcastChannel API
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("campusbus_realtime");
      channel.onmessage = (event) => {
        if (!event.data) return;

        if (event.data.type === "notification") {
          const newNotif = event.data.data;
          setNotifications((prev) => [newNotif, ...prev]);
          setActiveToast({ title: newNotif.title, message: newNotif.message });
          playNotificationSound();

          setTimeout(() => {
            setActiveToast((curr) => {
              if (curr?.title === newNotif.title) return null;
              return curr;
            });
          }, 7000);
        } else if (event.data.type === "location-update") {
          const { busNumber, lat, lng } = event.data.data;
          setBuses((prev) =>
            prev.map((b) => (b.busNumber === busNumber ? { ...b, currentLat: lat, currentLng: lng } : b))
          );
        }
      };
      return () => channel.close();
    } catch (err) {
      console.warn("BroadcastChannel failed:", err);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const userText = currentInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setCurrentInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.response || "No response received." }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I had trouble communicating with the server. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleFavorite = (busNumber: string) => {
    setFavorites((prev) =>
      prev.includes(busNumber) ? prev.filter((x) => x !== busNumber) : [...prev, busNumber]
    );
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const filteredBuses = buses.filter(
    (b) =>
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.driverName && b.driverName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              CampusBus <span className="text-xs text-[#D4AF37] px-2 py-0.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20">Student</span>
            </h1>
            <p className="text-[10px] text-slate-400">University of Barishal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <span className="text-[10px] text-[#D4AF37]">{user.studentId} • {user.department}</span>
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

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation / User Profile Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#003087] to-[#D4AF37] p-0.5 flex items-center justify-center font-bold text-white text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-xs text-slate-400">Student Profile</p>
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Student ID</span>
                <span className="font-mono text-white font-medium">{user.studentId || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="text-white font-medium">{user.department || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Batch</span>
                <span className="text-white font-medium">{user.batch || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Bus</span>
                <span className="text-amber-400 font-semibold">{user.busNumber || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Quick Tabs Menu */}
          <div className="glass-panel p-2 rounded-2xl border border-white/5 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === "track"
                  ? "bg-[#003087] text-white border border-[#D4AF37]/35 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Compass className="h-4.5 w-4.5 text-[#D4AF37]" />
              <span>Live Map Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab("ai-chat")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === "ai-chat"
                  ? "bg-[#003087] text-white border border-[#D4AF37]/35 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5 text-[#D4AF37]" />
              <span>AI Chat Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                activeTab === "notifications"
                  ? "bg-[#003087] text-white border border-[#D4AF37]/35 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Bell className="h-4.5 w-4.5 text-[#D4AF37]" />
              <span>Notification Center</span>
              {notifications.length > 0 && (
                <span className="absolute right-3 w-5 h-5 bg-[#D4AF37] text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main interactive panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === "track" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
              {/* Left Column: Map Tracker */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <BusMap
                  buses={buses}
                  selectedBusNumber={selectedBusNumber}
                  routes={routes}
                />
              </div>

              {/* Right Column: Fleet List */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#D4AF37]" />
                    <span>Transit Fleet</span>
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search bus or driver..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50"
                    />
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-3">
                  {filteredBuses.map((bus) => {
                    const isSelected = selectedBusNumber === bus.busNumber;
                    const isFavorite = favorites.includes(bus.busNumber);
                    const route = routes.find((r) => r.busId === bus.busNumber);

                    return (
                      <div
                        key={bus.id}
                        onClick={() => setSelectedBusNumber(isSelected ? null : bus.busNumber)}
                        className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-2.5 ${
                          isSelected
                            ? "border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.08)] bg-slate-900/90"
                            : "border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">{bus.busNumber}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                                bus.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {bus.status}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(bus.busNumber);
                            }}
                            className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <Star className={`h-4.5 w-4.5 ${isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : ""}`} />
                          </button>
                        </div>

                        {route && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{route.name}</span>
                          </div>
                        )}

                        {/* GOOGLE MAPS LIVE COORDINATES LINK (WOW Feature!) */}
                        {isSelected && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bus.currentLat},${bus.currentLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 font-bold rounded-xl transition-all duration-300 shadow-md text-[10px] w-full text-center mt-1"
                            onClick={(e) => e.stopPropagation()} // Stop triggering setSelectedBusNumber again!
                          >
                            🌎 Open Live GPS on Google Maps
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-2 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {bus.driverName || "No Driver Assigned"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Simulated coords
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredBuses.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-white/5">
                      No matching buses found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-chat" && (
            <div className="glass-panel rounded-2xl border border-white/5 h-[500px] flex flex-col overflow-hidden">
              {/* Chat Title */}
              <div className="p-4 bg-slate-950/40 border-b border-white/5 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-white text-sm">Interactive AI Schedule Chat</h4>
                  <p className="text-[10px] text-slate-400">Ask about Nathullabad route, Bus 12 status, schedules, and active locations</p>
                </div>
              </div>

              {/* Chat Message list */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#003087] text-white border border-[#D4AF37]/30 rounded-tr-none shadow-md"
                          : "bg-slate-900 text-slate-200 border border-white/5 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
                      {msg.sender === "user" ? "You" : "AI"}
                    </span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="self-start flex flex-col max-w-[80%] items-start">
                    <div className="bg-slate-900 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950/60 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask e.g. 'Show schedules of Nathullabad Route'..."
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  disabled={isChatLoading}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !currentInput.trim()}
                  className="bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/45 text-white p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-white text-base">Notification History</h3>
              <div className="flex flex-col gap-3.5">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/15 bg-slate-900/60 flex gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]" />
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl h-fit">
                      <Bell className="h-5 w-5 text-[#D4AF37] animate-swing" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5 text-slate-500 text-xs">
                    No active transit announcements today
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Real-time Floating Toast Alert Banner */}
          {activeToast && (
            <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-950/95 border border-[#D4AF37]/50 rounded-2xl p-5 shadow-[0_0_25px_rgba(212,175,55,0.2)] animate-float flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono flex items-center gap-1.5 animate-pulse">
                  🚨 Live Alert Pushed
                </span>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/5 transition-all"
                >
                  ✕
                </button>
              </div>
              <h4 className="font-extrabold text-white text-sm">{activeToast.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{activeToast.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
