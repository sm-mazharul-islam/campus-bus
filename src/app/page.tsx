"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ShieldCheck,
  Bus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Users,
  Navigation,
  MessageSquare,
  Activity,
  CloudSun,
  ShieldAlert,
  ChevronDown,
  Clock,
  BookOpen,
} from "lucide-react";
import BusMap from "@/components/map/bus-map";
import { getBuses } from "@/actions/buses";
import { getRoutes } from "@/actions/routes";

export default function Home() {
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Interactive Delay Estimator states
  const [estimatorRoute, setEstimatorRoute] = useState("Route A");
  const [estimatorTime, setEstimatorTime] = useState("08:00 AM");
  const [estimatedDelay, setEstimatedDelay] = useState<number | null>(null);
  const [delayReason, setDelayReason] = useState("");

  // Accordion state
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  // Load prefetched databases on client
  useEffect(() => {
    async function loadData() {
      try {
        const busData = await getBuses();
        setBuses(busData);
        const routeData = await getRoutes();
        setRoutes(routeData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const calculateDelayRisk = (e: React.FormEvent) => {
    e.preventDefault();
    let delay = 0;
    let reason = "Smooth traffic conditions expected.";

    if (estimatorRoute === "Route A") {
      if (estimatorTime === "08:00 AM" || estimatorTime === "08:30 AM") {
        delay = 12;
        reason = "🚨 High Delay Risk: Peak office and lecture traffic near Nathullabad Terminal crossing.";
      } else if (estimatorTime === "05:00 PM" || estimatorTime === "05:15 PM") {
        delay = 15;
        reason = "🚨 High Delay Risk: Evening return rush hour near Choumatha Circle.";
      } else {
        delay = 3;
        reason = "✅ Low Delay Risk: Off-peak hours. Normal driving conditions.";
      }
    } else {
      if (estimatorTime === "08:00 AM" || estimatorTime === "08:45 AM") {
        delay = 8;
        reason = "⚠️ Moderate Delay Risk: Dense slow-moving traffic approaching Sagardi Bridge.";
      } else {
        delay = 2;
        reason = "✅ Low Delay Risk: Quick commute via Rupatali pathway.";
      }
    }
    setEstimatedDelay(delay);
    setDelayReason(reason);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* SECTION 1 — IMMERSIVE HERO WITH RADAR GRADIENTS */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden border-b border-[#D4AF37]/15 py-12">
        {/* Moving Grid Background */}
        <div className="absolute inset-0 moving-grid pointer-events-none opacity-30" />
        
        {/* Radar sweeping graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] border border-[#D4AF37]/5 rounded-full pointer-events-none flex items-center justify-center">
          <div className="w-[550px] h-[550px] border border-[#D4AF37]/10 rounded-full flex items-center justify-center">
            <div className="w-[350px] h-[350px] border border-[#D4AF37]/15 rounded-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full animate-radar-sweep origin-center" />
            </div>
          </div>
        </div>

        {/* Navy/Gold custom blur overlays */}
        <div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] bg-[#003087]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[15%] right-[5%] w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Navigation header bar */}
        <div className="max-w-7xl w-full mx-auto px-6 absolute top-0 left-0 right-0 py-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Flashing Navy/Gold compass insignia */}
            <div className="bg-[#003087] p-2.5 rounded-2xl border border-[#D4AF37]/45 shadow-[0_0_12px_rgba(212,175,55,0.25)] animate-pulse-glow">
              <Compass className="h-6 w-6 text-[#D4AF37] animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                CampusBus
              </span>
              <span className="text-[10px] text-slate-400 block tracking-widest uppercase font-mono">University of Barishal</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/35 rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-md animate-float"
            >
              Register Pass
            </Link>
          </div>
        </div>

        {/* Hero message layout */}
        <div className="max-w-4xl w-full mx-auto px-6 text-center z-10 flex flex-col items-center gap-6 mt-20">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 animate-float">
            {/* SVG Yellow BU Bus logo representation */}
            <svg className="w-4 h-4 text-[#D4AF37] fill-current" viewBox="0 0 24 24">
              <path d="M19 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm-3-2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm-6 2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM23 15c0 1.7-1.3 3-3 3h-1c-.6 0-1-.4-1-1s.4-1 1-1h1c.6 0 1-1.3 1-1v-2c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h.5c.3 0 .5.2.5.5s-.2.5-.5.5H17c-.6 0-1-.4-1-1v-2.5c0-1.4-1.1-2.5-2.5-2.5h-5C8.1 11 7 12.1 7 13.5V16c0 .6-.4 1-1 1h.5c.3 0 .5.2.5.5s-.2.5-.5.5H5c-1.7 0-3-1.3-3-3v-7c0-1.7 1.3-3 3-3h15c1.7 0 3 1.3 3 3v7zM5 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm14 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
            <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] font-mono">University of Barishal Transit Section</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Seamless Campus Commutes <br />
            <span className="text-[#D4AF37] gold-glow relative inline-block">
              For BU Yellow Buses
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full shadow-lg animate-pulse" />
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
            Locate University of Barishal iconic yellow buses instantly on custom vector maps. Predict arrival sequences and verify live satellite coordinates directly on Google Maps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/50 rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-2 hover:scale-105"
            >
              <span>Access Dev Console</span>
              <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
            </Link>
            <Link
              href="#telemetry"
              className="px-8 py-4 bg-slate-900/60 hover:bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              Live Telemetry Stream
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DYNAMIC LIVE MAP & ACTIVE COORDINATES PREVIEW */}
      <section id="telemetry" className="py-24 border-b border-white/5 bg-slate-950/20 relative">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          {/* Map details */}
          <div className="lg:col-span-2 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/25 w-fit mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 font-mono">Telemetry feed: Active</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Predict Commute Sequences <br />
              <span className="text-[#D4AF37] gold-glow">Past, Present & Future.</span>
            </h2>

            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Our interactive tracking canvas details the exact progress of transit fleets. View past stops arrived, the active live location node, and ETAs for next predicted stops.
            </p>

            {/* Past/Current/Next/Future Detailed Indicators */}
            <div className="flex flex-col gap-3 bg-slate-900/60 p-5 rounded-2xl border border-[#D4AF37]/15">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#D4AF37] font-mono block">Live Sequence Telemetry (Bus 12)</span>
              
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px] font-bold">✓</div>
                  <div className="text-left text-xs">
                    <span className="text-slate-400 block font-mono text-[9px] uppercase">Past Station</span>
                    <span className="text-white font-semibold">Nathullabad Bus Terminal <span className="text-slate-500 font-mono font-medium">(Arrived 07:35 AM)</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-[#D4AF37] text-[10px] font-bold animate-pulse">⚡</div>
                  <div className="text-left text-xs">
                    <span className="text-amber-500 block font-mono text-[9px] uppercase font-black">Active Station (Live location)</span>
                    <span className="text-white font-bold">Choumatha Circle Crossing <span className="text-[#D4AF37] font-mono font-black animate-pulse">(ACTIVE)</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-[10px] font-bold">⏱</div>
                  <div className="text-left text-xs">
                    <span className="text-sky-400 block font-mono text-[9px] uppercase font-bold">Next Station (Prediction)</span>
                    <span className="text-white font-semibold">Rupatali Junction Terminal <span className="text-sky-400 font-mono font-bold">(ETA: In 4 mins)</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-bold">⌛</div>
                  <div className="text-left text-xs">
                    <span className="text-slate-500 block font-mono text-[9px] uppercase">Future Destination</span>
                    <span className="text-white font-medium">University Main Gate <span className="text-slate-500 font-mono">(Scheduled 08:05 AM)</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actual live vector map */}
          <div className="lg:col-span-3 w-full">
            <BusMap
              buses={buses}
              routes={routes}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — DOUBLE-DECKER GORGEOUS YELLOW BUS SHOWCASE */}
      <section className="py-24 border-b border-white/5 bg-slate-950/40 relative">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Vector representation of BU Yellow Bus */}
          <div className="glass-panel-gold p-8 rounded-3xl border border-[#D4AF37]/35 flex flex-col gap-6 relative justify-center items-center overflow-hidden min-h-[350px] shadow-[0_0_20px_rgba(212,175,55,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* SVG Double-Decker Yellow Bus Drawing (gorgeous layout!) */}
            <div className="animate-float flex flex-col items-center">
              <svg className="w-56 h-32 text-[#D4AF37]" viewBox="0 0 100 50">
                {/* Upper Deck */}
                <rect x="15" y="5" width="70" height="15" rx="3" fill="#D4AF37" stroke="#1e293b" strokeWidth="1" />
                <rect x="20" y="8" width="8" height="8" rx="1" fill="#0f172a" />
                <rect x="32" y="8" width="8" height="8" rx="1" fill="#0f172a" />
                <rect x="44" y="8" width="8" height="8" rx="1" fill="#0f172a" />
                <rect x="56" y="8" width="8" height="8" rx="1" fill="#0f172a" />
                <rect x="68" y="8" width="8" height="8" rx="1" fill="#0f172a" />
                
                {/* Lower Deck */}
                <rect x="10" y="20" width="80" height="20" rx="4" fill="#D4AF37" stroke="#1e293b" strokeWidth="1.5" />
                <rect x="15" y="23" width="10" height="10" rx="1" fill="#0f172a" />
                <rect x="30" y="23" width="10" height="10" rx="1" fill="#0f172a" />
                <rect x="45" y="23" width="10" height="10" rx="1" fill="#0f172a" />
                <rect x="60" y="23" width="10" height="10" rx="1" fill="#0f172a" />
                {/* Door */}
                <rect x="75" y="20" width="10" height="20" fill="#0f172a" />

                {/* Wheels */}
                <circle cx="28" cy="40" r="6" fill="#1e293b" stroke="#D4AF37" strokeWidth="2" />
                <circle cx="28" cy="40" r="2.5" fill="#f8fafc" />
                
                <circle cx="72" cy="40" r="6" fill="#1e293b" stroke="#D4AF37" strokeWidth="2" />
                <circle cx="72" cy="40" r="2.5" fill="#f8fafc" />

                {/* Headlight */}
                <circle cx="9" cy="30" r="1.5" fill="#fef08a" />
              </svg>
              <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase font-mono mt-4">
                BU Double-Decker Yellow Fleet In-Service
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">Insignia Showcase</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">The BU Yellow Bus Fleet</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
                The yellow double-deckers are the pride of the University of Barishal. Equipped with GPS coordinate trackers, they transport thousands of students across the city daily.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 block">Fleet Capacity</span>
                <span className="font-bold text-white text-sm">60+ Students / Bus</span>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 block">Active Status</span>
                <span className="font-bold text-emerald-400 text-sm">Real-Time Sync</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 — ROLE PERSONAS PLAYGROUND */}
      <section className="py-24 border-b border-white/5 bg-slate-950/20 relative">
        <div className="max-w-7xl w-full mx-auto px-6 text-center flex flex-col gap-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">Developer Playground</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Choose Your Console Role</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto mt-2">
              Select one of our preset quick-access profiles below to instantly test different dashboards in one click!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Flip-Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between text-center gap-6 group hover:translate-y-[-5px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Student Portal</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sadia Islam • 11th CSE</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  View scheduled bus timelines, verify live coordinates, ask AI Schedule assistants questions, and customize notifications.
                </p>
              </div>

              <Link
                href="/login?email=student@campusbus.com"
                className="w-full bg-[#003087] hover:bg-[#00205c] border border-blue-500/35 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                <span>Login Student Panel</span>
                <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
              </Link>
            </div>

            {/* Driver Flip-Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 flex flex-col justify-between text-center gap-6 group hover:translate-y-[-5px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Driver Console</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Abul Kalam • Bus 12</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Control the interactive virtual steering wheel, start live drive simulations updating coordinates, and trigger SOS alerts.
                </p>
              </div>

              <Link
                href="/login?email=driver1@campusbus.com"
                className="w-full bg-[#003087] hover:bg-[#00205c] border border-amber-500/35 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                <span>Login Driver Console</span>
                <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
              </Link>
            </div>

            {/* Admin Flip-Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 flex flex-col justify-between text-center gap-6 group hover:translate-y-[-5px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Admin Dashboard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Prof. Mahmudul Hasan</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Manage active bus inventories, build route stop maps interactively, view analytical ridership Recharts, and broadcast FCM alerts.
                </p>
              </div>

              <Link
                href="/login?email=admin@campusbus.com"
                className="w-full bg-[#003087] hover:bg-[#00205c] border border-purple-500/35 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                <span>Login Admin Panel</span>
                <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 5 — INTERACTIVE DELAY RISK ESTIMATOR WIDGET */}
      <section className="py-24 border-b border-white/5 bg-slate-950/40 relative">
        <div className="max-w-3xl w-full mx-auto px-6 text-center flex flex-col gap-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">Delay Heuristics</span>
            <h2 className="text-3xl font-extrabold text-white">Route Delay Probability Estimator</h2>
            <p className="text-xs text-slate-400 mt-2">
              Select your transit route and expected boarding hour below to calculate traffic delay risks.
            </p>
          </div>

          <form onSubmit={calculateDelayRisk} className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/20 flex flex-col gap-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Select Transit Pathway</label>
                <select
                  value={estimatorRoute}
                  onChange={(e) => setEstimatorRoute(e.target.value)}
                  className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Route A">Route A (Nathullabad to Campus)</option>
                  <option value="Route B">Route B (Rupatali to Campus)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Boarding Time</label>
                <select
                  value={estimatorTime}
                  onChange={(e) => setEstimatorTime(e.target.value)}
                  className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="07:30 AM">07:30 AM (Morning Off-Peak)</option>
                  <option value="08:00 AM">08:00 AM (Morning Rush hour)</option>
                  <option value="08:30 AM">08:30 AM (Lecture Rush)</option>
                  <option value="01:30 PM">01:30 PM (Midday Off-Peak)</option>
                  <option value="05:15 PM">05:15 PM (Evening Exit Rush)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/35 text-white py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-1.5"
            >
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span>Compute Delay Probability</span>
            </button>
          </form>

          {estimatedDelay !== null && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-[#D4AF37]/25 text-left flex flex-col gap-2.5 animate-float shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Analysis Result:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  estimatedDelay > 10
                    ? "bg-red-500/10 text-red-400 border border-red-500/25"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                }`}>
                  {estimatedDelay}% Delay Risk
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {delayReason} Expected delay on this route: **{estimatedDelay} minutes**.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6 — GOOGLE MAPS TELEMETRY TIMELINE */}
      <section className="py-24 border-b border-white/5 relative bg-slate-950/20">
        <div className="max-w-7xl w-full mx-auto px-6 text-center flex flex-col gap-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">commuter sequence</span>
            <h2 className="text-3xl font-extrabold text-white">Google Maps Telemetry Flow</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
              How real-world live GPS positions are synced and redirectable in 4 quick steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-3">
              <div className="text-base font-extrabold text-[#D4AF37] font-mono">01</div>
              <h4 className="font-bold text-white text-sm">GPS Broadcast</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The yellow bus driver console steers and broadcasts coordinates in real-time.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-3">
              <div className="text-base font-extrabold text-[#D4AF37] font-mono">02</div>
              <h4 className="font-bold text-white text-sm">Sequence Ticks</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stops automatically transition states from past arrived to active live locations.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-3">
              <div className="text-base font-extrabold text-[#D4AF37] font-mono">03</div>
              <h4 className="font-bold text-white text-sm">Google Maps Link</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clickable redirection pins are computed based on the active bus coordinates.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-3">
              <div className="text-base font-extrabold text-[#D4AF37] font-mono">04</div>
              <h4 className="font-bold text-white text-sm">Satellite Telemetry</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Students click links to preview real-world locations directly on satellite Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CORE CAPABILITIES SHOWCASE */}
      <section className="py-24 border-b border-white/5 relative bg-slate-950/40">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col gap-12">
          <div className="text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">State-of-the-art MVP</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Full-Stack Core Competencies</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 max-w-md leading-relaxed">
              Every detail is crafted with premium visual aesthetics, gold glows, responsive CSS keyframes, and local SQLite data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="p-3 bg-[#003087] border border-[#D4AF37]/20 rounded-xl w-fit text-[#D4AF37] group-hover:scale-105 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Google Maps Live</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dynamically generates live satellite hyperlinks to match simulated telemetry sequences instantly.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="p-3 bg-[#003087] border border-[#D4AF37]/20 rounded-xl w-fit text-[#D4AF37] group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Intelligent AI Chat</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Localized schedule inspector parsing queries to answer coordinates, stops, and fleet status questions.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="p-3 bg-[#003087] border border-[#D4AF37]/20 rounded-xl w-fit text-[#D4AF37] group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Interactive Analytics</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Aggregates active telemetry scan trends using Recharts line and bar graphs on the Admin panel.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="p-3 bg-[#003087] border border-[#D4AF37]/20 rounded-xl w-fit text-[#D4AF37] group-hover:scale-105 transition-transform">
                <Navigation className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Stop Planner Builder</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click-based map stops designer mapping longitude bounds directly to schema tables seamlessly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8 — ROUTE SCHEDULES Accordion */}
      <section className="py-24 bg-slate-950/20 relative">
        <div className="max-w-3xl w-full mx-auto px-6 flex flex-col gap-10">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">Transit FAQ & Hours</span>
            <h2 className="text-3xl font-extrabold text-white">Route Schedules Accordion</h2>
            <p className="text-xs text-slate-400 mt-2">Timings, assigned drivers, and stops for primary pathways</p>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Accordion 1 */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 0 ? null : 0)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-white text-sm">Nathullabad to Campus (Route A) details</span>
                <ChevronDown className={`h-4.5 w-4.5 text-[#D4AF37] transition-transform duration-300 ${activeAccordion === 0 ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === 0 && (
                <div className="px-5 pb-5 text-xs text-slate-400 border-t border-white/5 pt-4 flex flex-col gap-2 leading-relaxed">
                  <p>🚍 <strong>Assigned Yellow Bus:</strong> Bus 12 (Driver: Kalam)</p>
                  <p>⏱️ <strong>Schedules:</strong> 07:30 AM, 08:30 AM, 01:30 PM, 05:15 PM</p>
                  <p>📍 <strong>Stops:</strong> Nathullabad Terminus ➔ C&B Road Crossing ➔ Choumatha Circle ➔ Rupatali Junction ➔ BU Main Gate</p>
                </div>
              )}
            </div>

            {/* Accordion 2 */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 1 ? null : 1)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-white text-sm">Rupatali to Campus (Route B) details</span>
                <ChevronDown className={`h-4.5 w-4.5 text-[#D4AF37] transition-transform duration-300 ${activeAccordion === 1 ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === 1 && (
                <div className="px-5 pb-5 text-xs text-slate-400 border-t border-white/5 pt-4 flex flex-col gap-2 leading-relaxed">
                  <p>🚍 <strong>Assigned Yellow Bus:</strong> Bus 07 (Driver: Mofizur)</p>
                  <p>⏱️ <strong>Schedules:</strong> 07:45 AM, 08:45 AM, 02:00 PM, 05:30 PM</p>
                  <p>📍 <strong>Stops:</strong> Rupatali Terminal ➔ Sagardi Bridge ➔ BU Main Gate</p>
                </div>
              )}
            </div>

            {/* Accordion 3 */}
            <div className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 2 ? null : 2)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-white text-sm">How to verify coordinate details?</span>
                <ChevronDown className={`h-4.5 w-4.5 text-[#D4AF37] transition-transform duration-300 ${activeAccordion === 2 ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === 2 && (
                <div className="px-5 pb-5 text-xs text-slate-400 border-t border-white/5 pt-4 leading-relaxed font-mono text-[11px]">
                  All active coordinates can be clicked and opened directly on real-world Google Maps satellite overlays for testing!
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 9 — WEATHER INTEGRATION SAFETY WARNING */}
      <section className="py-24 bg-slate-950/40 relative border-b border-white/5">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="glass-panel-gold p-6 rounded-2xl border border-[#D4AF37]/35 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[#D4AF37]">
                <CloudSun className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono">OpenWeather Integration safety banner</span>
                <h4 className="font-bold text-white text-base">Clear Commuter Pathways today</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  University Transport section notes clear pathways under sunny Barishal conditions. No storm blocks are likely to delay morning trips today. Commute safely!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 text-center lg:text-left">
            <div>
              <span className="text-xs uppercase tracking-widest text-red-500 font-bold block mb-1">Safety Measures</span>
              <h2 className="text-3xl font-extrabold text-white">Broadcasting Emergency Warns</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Our emergency SOS button lets drivers warn administrators immediately. If a bus experiences heavy delay or weather problems, warning banners will flash in student notification panels.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl border border-red-500/15 bg-red-500/5 flex items-center gap-3 w-fit mx-auto lg:mx-0">
              <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse shrink-0" />
              <span className="text-left text-[11px] text-slate-300">SOS triggers broadcast global warnings in one-click.</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 10 — REGISTRAR TRANSPORT NOTICE BULLETIN */}
      <section className="py-24 bg-slate-950/20 relative">
        <div className="max-w-3xl w-full mx-auto px-6 text-center flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-8 w-8 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block">Academic Bulletin</span>
            <h2 className="text-3xl font-extrabold text-white">Transport Section Notice Board</h2>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#003087]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center text-xs text-[#D4AF37] font-mono border-b border-white/5 pb-2">
              <span>NOTICE #BU-T-2026-90</span>
              <span>DATE: MAY 23, 2026</span>
            </div>

            <h4 className="font-bold text-white text-sm">Special Weekend Timetables for Final Exams</h4>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Please note that extra yellow bus trips have been added to Nathullabad Route A starting next Friday to accommodate semester final exams. Buses will leave the Nathullabad Terminus at **08:00 AM** and **02:00 PM** respectively. Stand by your stop nodes on time!
            </p>

            <span className="text-[10px] text-slate-500 font-mono mt-2 block">
              Issued by: Transport Section Office, University of Barishal (https://bu.edu.bd/)
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-[10px] text-slate-500 border-t border-white/5 mt-auto bg-slate-950/40">
        &copy; {new Date().getFullYear()} CampusBus • University of Barishal (BU) Commuter Portal. All rights reserved. <br />
        <a href="https://bu.edu.bd/" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors mt-1 inline-block">
          bu.edu.bd
        </a>
      </footer>
    </div>
  );
}
