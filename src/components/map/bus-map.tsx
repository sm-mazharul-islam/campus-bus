"use client";

import React from "react";
import { Navigation, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Stop {
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface BusMapProps {
  buses: Array<{
    busNumber: string;
    currentLat: number;
    currentLng: number;
    status: string;
  }>;
  selectedBusNumber?: string | null;
  routes: Array<{
    name: string;
    stops: string; // JSON string
    busId: string | null;
  }>;
  interactive?: boolean;
  onAddStop?: (stop: Omit<Stop, "order">) => void;
  currentStopIndex?: number; // Added to highlight dynamic path tracking
}

export default function BusMap({
  buses,
  selectedBusNumber,
  routes,
  interactive = false,
  onAddStop,
  currentStopIndex = 1, // Default to a realistic active index for preview
}: BusMapProps) {
  
  // Bounds around Barishal City (Lat: 22.66 to 22.83, Lng: 90.32 to 90.39)
  const minLat = 22.66;
  const maxLat = 22.83;
  const minLng = 90.32;
  const maxLng = 90.39;

  const mapToCanvas = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  const canvasToMap = (x: number, y: number) => {
    const lng = minLng + (x / 100) * (maxLng - minLng);
    const lat = minLat + (1 - y / 100) * (maxLat - minLat);
    return { lat, lng };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onAddStop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    const coords = canvasToMap(clickX, clickY);

    const name = `Stop #${Math.floor(Math.random() * 100) + 1}`;
    onAddStop({ name, lat: parseFloat(coords.lat.toFixed(5)), lng: parseFloat(coords.lng.toFixed(5)) });
  };

  return (
    <div className="relative w-full h-[450px] md:h-[520px] glass-panel rounded-3xl overflow-hidden gold-border-glow border border-[#D4AF37]/30 flex flex-col shadow-2xl">
      {/* Map Header */}
      <div className="p-4 bg-slate-950/90 border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#003087] p-2 rounded-xl border border-[#D4AF37]/45 shadow-[0_0_10px_rgba(212,175,55,0.2)] animate-pulse-glow">
            <Navigation className="h-5 w-5 text-[#D4AF37] fill-current rotate-45" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
              Barishal University Live Route Tracker
            </span>
            <p className="text-[10px] text-slate-400">Past, Active, and Future Telemetry stream</p>
          </div>
        </div>
        
        {/* Dynamic status count */}
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase">
          Feed: Connected
        </span>
      </div>

      {/* Map Grid Canvas */}
      <div
        className={`relative flex-1 bg-[#060912] overflow-hidden select-none ${
          interactive ? "cursor-crosshair" : "cursor-default"
        }`}
        onClick={handleMapClick}
      >
        {/* Moving grid overlay */}
        <div className="absolute inset-0 moving-grid opacity-10 pointer-events-none" />

        {/* River Kirtankhola Outline / Landmarks (Geographic layout of Barishal) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path
            d="M -100,320 C 150,290 280,210 320,240 C 380,260 480,410 650,330 C 800,280 950,420 1200,340"
            fill="none"
            stroke="#003087"
            strokeWidth="50"
            className="blur-md"
          />
          <path
            d="M -100,320 C 150,290 280,210 320,240 C 380,260 480,410 650,330 C 800,280 950,420 1200,340"
            fill="none"
            stroke="#0284c7"
            strokeWidth="15"
          />
          {/* Bridge */}
          <line x1="300" y1="210" x2="330" y2="270" stroke="#f59e0b" strokeWidth="6" />
        </svg>

        {/* Route stop paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {routes.map((route, routeIdx) => {
            const stops: Stop[] = JSON.parse(route.stops);
            if (stops.length < 2) return null;

            const pathD = stops
              .map((stop, i) => {
                const { x, y } = mapToCanvas(stop.lat, stop.lng);
                return `${i === 0 ? "M" : "L"} ${x}% ${y}%`;
              })
              .join(" ");

            const isSelected = selectedBusNumber ? route.busId === selectedBusNumber : true;

            return (
              <g key={routeIdx}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? "#D4AF37" : "#003087"}
                  strokeWidth="8"
                  className="opacity-10 blur-sm transition-all duration-300"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? "#D4AF37" : "#003087"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isSelected ? "none" : "3 6"}
                  className="opacity-70 transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Multi-State Stops Markers */}
        {routes.map((route) => {
          const stops: Stop[] = JSON.parse(route.stops);
          const isSelectedRoute = selectedBusNumber ? route.busId === selectedBusNumber : true;

          return stops.map((stop, idx) => {
            const { x, y } = mapToCanvas(stop.lat, stop.lng);
            if (!isSelectedRoute) return null;

            // Determine dynamic state: PAST, CURRENT, NEXT, FUTURE
            let state: "past" | "current" | "next" | "future" = "future";
            let stateColor = "bg-slate-800 border-slate-600";
            let ringColor = "";

            if (idx < currentStopIndex) {
              state = "past";
              stateColor = "bg-emerald-500 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
            } else if (idx === currentStopIndex) {
              state = "current";
              stateColor = "bg-amber-500 border-slate-950 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.8)]";
              ringColor = "animate-ping bg-amber-500/20";
            } else if (idx === currentStopIndex + 1) {
              state = "next";
              stateColor = "bg-sky-500 border-slate-950 scale-110 shadow-[0_0_10px_rgba(56,189,248,0.7)]";
              ringColor = "animate-pulse bg-sky-500/10";
            }

            return (
              <div
                key={`${route.name}-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-300"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Flashing Radar ring */}
                {ringColor && <div className={`absolute inset-0 -m-2.5 rounded-full ${ringColor}`} />}

                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${stateColor}`}>
                  {state === "past" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  {state === "current" && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  {state === "next" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  {state === "future" && <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                </div>

                {/* Stop Telemetry Hover Box */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-950/95 border border-[#D4AF37]/30 text-[10px] text-white px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                  <div className="font-bold text-[#D4AF37]">{stop.name}</div>
                  <div className="flex gap-2 mt-1 font-mono text-[9px] text-slate-400">
                    <span>Order: #{stop.order}</span>
                    <span className="uppercase font-extrabold text-white">
                      {state === "past" && "✓ Arrived"}
                      {state === "current" && "⚡ Active Location"}
                      {state === "next" && "⏱ Next (ETA: 4 mins)"}
                      {state === "future" && "⌛ Scheduled"}
                    </span>
                  </div>
                </div>
              </div>
            );
          });
        })}

        {/* Bus Markers (Yellow Bus Logo representing BU double-deckers!) */}
        {buses
          .filter((bus) => bus.status === "ACTIVE")
          .map((bus) => {
            const { x, y } = mapToCanvas(bus.currentLat, bus.currentLng);
            const isSelected = selectedBusNumber ? bus.busNumber === selectedBusNumber : true;

            if (x < 0 || x > 100 || y < 0 || y > 100) return null;

            return (
              <div
                key={bus.busNumber}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-30 ${
                  isSelected ? "scale-115" : "scale-90 opacity-40"
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Ping Radar */}
                <div className="absolute inset-0 -m-3.5 rounded-full bg-amber-500/25 animate-ping" />

                {/* GORGEOUS YELLOW BUS BOX (representing BU bus) */}
                <div className="relative bg-[#D4AF37] hover:bg-[#f4d068] text-slate-950 p-2.5 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] border-2 border-slate-950 flex items-center justify-center gap-1.5 font-black text-xs select-none">
                  {/* Custom SVGs Yellow Double-Decker icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm-3-2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm-6 2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM23 15c0 1.7-1.3 3-3 3h-1c-.6 0-1-.4-1-1s.4-1 1-1h1c.6 0 1-1.3 1-1v-2c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h.5c.3 0 .5.2.5.5s-.2.5-.5.5H17c-.6 0-1-.4-1-1v-2.5c0-1.4-1.1-2.5-2.5-2.5h-5C8.1 11 7 12.1 7 13.5V16c0 .6-.4 1-1 1h.5c.3 0 .5.2.5.5s-.2.5-.5.5H5c-1.7 0-3-1.3-3-3v-7c0-1.7 1.3-3 3-3h15c1.7 0 3 1.3 3 3v7zM5 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm14 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  <span>{bus.busNumber}</span>
                </div>
              </div>
            );
          })}

        {/* Landmarks / Campus label */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center z-10"
          style={{ left: "80%", top: "25%" }}
        >
          <div className="bg-[#003087]/45 border border-[#D4AF37]/50 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <span className="text-[9px] font-black tracking-widest text-[#D4AF37] uppercase block">
              University of Barishal
            </span>
            <span className="text-[11px] text-white font-bold">Main Campus</span>
          </div>
        </div>
      </div>

      {/* Map Legend: Details dynamic telemetry states */}
      <div className="p-3 bg-slate-950/95 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] text-slate-400 z-10 font-mono">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>✓ Past Location (Arrived)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>⚡ Current Location (Active)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <span>⏱ Next Location (Prediction)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span>⌛ Future Destination</span>
        </div>
      </div>
    </div>
  );
}
