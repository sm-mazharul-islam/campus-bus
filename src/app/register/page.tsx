"use client";

import React, { useState } from "react";
import { registerUser } from "@/actions/auth";
import Link from "next/link";
import { Compass, User, Mail, Lock, Phone, BookOpen, ShieldAlert, CheckCircle, Bus } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [batch, setBatch] = useState("11th");
  const [phone, setPhone] = useState("");
  const [busNumber, setBusNumber] = useState("Bus 12");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const res = await registerUser({
      name,
      email,
      password,
      role,
      studentId: role !== "ADMIN" ? studentId : undefined,
      department: role === "STUDENT" ? department : undefined,
      batch: role === "STUDENT" ? batch : undefined,
      phone,
      busNumber: role !== "ADMIN" ? busNumber : undefined,
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glow blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#003087]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full flex flex-col gap-6 z-10 my-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="bg-[#003087] p-2.5 rounded-xl border border-[#D4AF37]/30 shadow-lg mb-2">
            <Compass className="h-6 w-6 text-[#D4AF37] animate-spin-slow" />
          </Link>
          <h2 className="text-2xl font-black text-white">Create your pass</h2>
          <p className="text-xs text-slate-400">Register for a digital boarding pass or driver console</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col gap-5">
          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-slate-950/60 border border-white/5 rounded-xl">
            {(["STUDENT", "DRIVER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  role === r
                    ? "bg-[#003087] text-white border border-[#D4AF37]/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Sadia Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                  required
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. sadia@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                    required
                />
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Password (min 8 chars)</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {role === "STUDENT" ? "Student ID" : "Driver License ID"}
                </label>
                <input
                  type="text"
                  placeholder={role === "STUDENT" ? "e.g. CSE-2022-045" : "e.g. D-105"}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phone number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. +88017..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none"
                    required
                  />
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>

            {role === "STUDENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="BBA">Business Administration (BBA)</option>
                    <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
                    <option value="Math">Mathematics (Math)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Batch Year</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="11th">11th Batch</option>
                    <option value="12th">12th Batch</option>
                    <option value="13th">13th Batch</option>
                    <option value="14th">14th Batch</option>
                  </select>
                </div>
              </div>
            )}

            {/* Assigned Bus Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {role === "STUDENT" ? "Primary Bus Route" : "Assigned Fleet Bus"}
              </label>
              <div className="relative">
                <select
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none"
                >
                  <option value="Bus 12">Bus 12 (Nathullabad route)</option>
                  <option value="Bus 07">Bus 07 (Rupatali route)</option>
                  <option value="Bus 03">Bus 03 (Special route)</option>
                </select>
                <Bus className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/45 text-white py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Registering pass..." : "Register Boarding Pass"}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have a registered pass?{" "}
            <Link href="/login" className="text-[#D4AF37] hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Back link */}
        <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors text-center">
          &larr; Back to Landing Page
        </Link>
      </div>
    </div>
  );
}
