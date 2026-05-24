"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  Compass,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  LogOut,
} from "lucide-react";
import { getBuses, updateBusLocation } from "@/actions/buses";
import { getRoutes } from "@/actions/routes";
import { createNotification } from "@/actions/notifications";
import { signOut } from "next-auth/react";
import BusMap from "../map/bus-map";

interface DriverDashboardProps {
  user: {
    name: string;
    studentId?: string | null; // Represents Driver ID
    busNumber?: string | null;
  };
}

export default function DriverDashboard({ user }: DriverDashboardProps) {
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [myBus, setMyBus] = useState<any | null>(null);
  const [myRoute, setMyRoute] = useState<any | null>(null);
  
  // GPS Broadcast states
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [steeringAngle, setSteeringAngle] = useState(0);

  // Fetch driver's assigned bus and route data
  useEffect(() => {
    async function fetchData() {
      const busData = await getBuses();
      setBuses(busData);
      const matchedBus = busData.find((b) => b.busNumber === user.busNumber);
      setMyBus(matchedBus || null);

      const routeData = await getRoutes();
      setRoutes(routeData);
      const matchedRoute = routeData.find((r) => r.busId === user.busNumber);
      setMyRoute(matchedRoute || null);
    }
    fetchData();
  }, [user.busNumber]);

  // Steer Angle Animation Loop (Simulated wheel bounce when driving!)
  useEffect(() => {
    if (!isBroadcasting) return;

    const interval = setInterval(() => {
      // Simulate minor steering wheel vibrations
      setSteeringAngle((prev) => {
        const vibration = (Math.random() - 0.5) * 8;
        let newAngle = prev + vibration;
        // Clamp steer angle between -45 and 45 degrees
        if (newAngle > 45) newAngle = 45;
        if (newAngle < -45) newAngle = -45;
        return newAngle;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isBroadcasting]);

  // GPS Simulation engine - updates SQLite coordinates every few seconds
  useEffect(() => {
    if (!isBroadcasting || !myRoute || !myBus) return;

    const stops = JSON.parse(myRoute.stops);
    if (stops.length === 0) return;

    const intervalTime = 4000 / speedMultiplier;

    const interval = setInterval(async () => {
      const nextIndex = (currentStopIndex + 1) % stops.length;
      setCurrentStopIndex(nextIndex);
      
      const targetStop = stops[nextIndex];
      // Update location in SQLite database
      const res = await updateBusLocation(myBus.busNumber, targetStop.lat, targetStop.lng);
      if (res.bus) {
        setMyBus(res.bus);
        
        // Broadcast location-update event in real-time
        try {
          const channel = new BroadcastChannel("campusbus_realtime");
          channel.postMessage({
            type: "location-update",
            data: { busNumber: myBus.busNumber, lat: targetStop.lat, lng: targetStop.lng }
          });
          channel.close();
        } catch (e) {
          console.warn("Location broadcast failed:", e);
        }
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isBroadcasting, myRoute, myBus, currentStopIndex, speedMultiplier]);

  const handleSteerWheel = (direction: "left" | "right") => {
    setSteeringAngle((prev) => {
      const delta = direction === "left" ? -15 : 15;
      const newAngle = prev + delta;
      return Math.min(Math.max(newAngle, -90), 90);
    });
  };

  const handleSOSAlert = async () => {
    if (!myBus) return;
    const title = `EMERGENCY ALERT: ${myBus.busNumber}`;
    const msg = `🚨 Driver ${user.name} of ${myBus.busNumber} has broadcasted an emergency delay alert. Transit delays are expected on this route. Please stand by.`;
    
    const res = await createNotification(title, msg);
    if (res.success && res.notification) {
      try {
        const channel = new BroadcastChannel("campusbus_realtime");
        channel.postMessage({ type: "notification", data: res.notification });
        channel.close();
      } catch (e) {
        console.warn("SOS broadcast failed:", e);
      }
    }
    alert("🚨 Emergency SOS alert broadcasted successfully to all students!");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

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
              CampusBus <span className="text-xs text-amber-500 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 font-bold">Driver Console</span>
            </h1>
            <p className="text-[10px] text-slate-400">University of Barishal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <span className="text-[10px] text-[#D4AF37]">Driver ID: {user.studentId} • {user.busNumber}</span>
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

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Steering wheel simulator & controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Steering Wheel Box */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <h3 className="font-bold text-white text-base flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span>Simulated steering wheel</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Steer the bus or watch it react as simulation drives</p>
              </div>

              {/* Steering Wheel Graphic */}
              <div
                className="w-48 h-48 rounded-full border-8 border-slate-700 bg-slate-950 flex items-center justify-center relative shadow-2xl transition-transform duration-200"
                style={{ transform: `rotate(${steeringAngle}deg)` }}
              >
                {/* Internal spokes */}
                <div className="absolute w-2 h-40 bg-slate-700" />
                <div className="absolute h-2 w-40 bg-slate-700" />
                {/* Center Hub */}
                <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                    <Navigation className="h-3 w-3 text-slate-950 rotate-45" />
                  </div>
                </div>
              </div>

              {/* Steering Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleSteerWheel("left")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white border border-white/5"
                >
                  ◀ Steer Left
                </button>
                <button
                  onClick={() => handleSteerWheel("right")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white border border-white/5"
                >
                  Steer Right ▶
                </button>
              </div>
            </div>

            {/* Simulated GPS Broadcast Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5 relative justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Navigation className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  <span>GPS location publisher</span>
                </h3>
                <p className="text-[10px] text-slate-400">Broadcasts your live coordinates to student dashboards</p>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Fleet</span>
                  <span className="font-mono text-white font-bold">{myBus?.busNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Station</span>
                  <span className="text-amber-400 font-semibold truncate max-w-[150px]">
                    {myRoute ? JSON.parse(myRoute.stops)[currentStopIndex]?.name : "No Route"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Latitude</span>
                  <span className="font-mono text-white">{myBus?.currentLat.toFixed(5)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Longitude</span>
                  <span className="font-mono text-white">{myBus?.currentLng.toFixed(5)}</span>
                </div>
              </div>

              {/* Action Simulation buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsBroadcasting(!isBroadcasting)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                      isBroadcasting
                        ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {isBroadcasting ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{isBroadcasting ? "Pause GPS Broadcast" : "Start Live Driving"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStopIndex(0);
                      setIsBroadcasting(false);
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 rounded-xl"
                    title="Reset Route Position"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Driving speed slider */}
                {isBroadcasting && (
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Drive Simulation speed</span>
                      <span className="text-amber-500 font-bold">{speedMultiplier}x Speed</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="1"
                      value={speedMultiplier}
                      onChange={(e) => setSpeedMultiplier(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Geographic Map View */}
          <BusMap
            buses={myBus ? [myBus] : []}
            selectedBusNumber={myBus?.busNumber}
            routes={myRoute ? [myRoute] : []}
          />
        </div>

        {/* Right Column: Emergency & Google Maps Live redirection */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Google Maps Live Link Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-[#D4AF37]" />
                <span>Google Maps Redirection</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Click the link below to verify your simulated live GPS coordinates directly on real-world Google Maps satellite views.</p>
            </div>

            {myBus && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${myBus.currentLat},${myBus.currentLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 animate-pulse-glow"
              >
                🌎 Open Live GPS on Google Maps
              </a>
            )}
          </div>

          {/* Red Big SOS Alert Button */}
          <div className="glass-panel p-6 rounded-2xl border border-red-500/15 bg-red-500/5 flex flex-col gap-4 text-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <ShieldAlert className="h-10 w-10 text-red-500 animate-pulse" />
              <h3 className="font-bold text-white text-base">Route Emergency SOS</h3>
              <p className="text-[10px] text-slate-400">
                Clicking the button below instantly broadcasts an emergency announcement to all students registered to your bus route!
              </p>
            </div>

            <button
              onClick={handleSOSAlert}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/10 active:scale-95 transition-all duration-300"
            >
              ⚠️ TRIGGER EMERGENCY SOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
