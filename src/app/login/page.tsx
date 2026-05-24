"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Compass, Key, Mail, Lock, ShieldAlert, CheckCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-slate-400 text-xs font-mono">
        Loading Auth Console...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill passwords automatically for quick-test developer emails!
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      if (emailParam.includes("student")) {
        setPassword("student123");
      } else if (emailParam.includes("driver")) {
        setPassword("driver123");
      } else if (emailParam.includes("admin")) {
        setPassword("admin123");
      }
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glow blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#003087]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full flex flex-col gap-6 z-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="bg-[#003087] p-2.5 rounded-xl border border-[#D4AF37]/30 shadow-lg mb-2">
            <Compass className="h-6 w-6 text-[#D4AF37] animate-spin-slow" />
          </Link>
          <h2 className="text-2xl font-black text-white">Welcome back</h2>
          <p className="text-xs text-slate-400">Sign in to your CampusBus Transit dashboard</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col gap-5 relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. student@campusbus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#D4AF37]/50"
                  required
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Secure Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-[#D4AF37]/50"
                  required
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
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
              className="w-full bg-[#003087] hover:bg-[#00205c] border border-[#D4AF37]/45 text-white py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating console..." : "Sign In to Console"}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don't have a registered pass?{" "}
            <Link href="/register" className="text-[#D4AF37] hover:underline font-semibold">
              Register here
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
