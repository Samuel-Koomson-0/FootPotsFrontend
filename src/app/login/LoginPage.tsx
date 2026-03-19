"use client";
// src/app/login/LoginPage.tsx

import { useState } from "react";
import { loginUser, signupUser } from "@/lib/api";
import { User } from "@/types";

interface Props {
  onAuthSuccess: (user: User) => void;
}

export default function LoginPage({ onAuthSuccess }: Props) {
  const [tab, setTab]       = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const [form, setForm] = useState({
    email: "", password: "", username: "", fplTeamId: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (tab === "signup" && (!form.username || !form.fplTeamId)) { setError("Please fill in all fields."); return; }

    setLoading(true);
    try {
      const user = tab === "login"
        ? await loginUser(form.email, form.password)
        : await signupUser(form.email, form.password, form.username, form.fplTeamId);
      onAuthSuccess(user);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#37003c] flex overflow-hidden relative">

      {/* BG grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,135,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      {/* Glow blob */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)" }} />

      {/* ── LEFT — Branding ── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-12 relative z-10">
        <div className="font-display text-6xl font-bold text-[#00ff87] tracking-tight mb-2">
          foot<span className="text-white">pots</span>
        </div>
        <p className="text-white/50 text-base mb-14 tracking-wide">
          Fantasy Football · Real Stakes · Real Rewards
        </p>

        {[
          { icon: "⚽", title: "Join a Pot",         desc: "Pick a league, pay your entry fee, and compete against real managers." },
          { icon: "📊", title: "Live Leaderboard",   desc: "Scores sync automatically from the FPL API every gameweek." },
          { icon: "💰", title: "Winner Takes All",   desc: "Top the board when the GW ends and collect the entire prize pool." },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-4 mb-7">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.18)" }}>
              {f.icon}
            </div>
            <div>
              <p className="text-white font-bold text-[15px] mb-0.5">{f.title}</p>
              <p className="text-white/40 text-[13px] leading-snug">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RIGHT — Auth Card ── */}
      <div className="w-full lg:w-[440px] bg-white flex flex-col justify-center px-8 py-12 lg:px-11 shadow-2xl relative z-10">

        {/* Mobile logo */}
        <div className="lg:hidden font-display text-3xl font-bold text-[#37003c] mb-1 text-center">
          foot<span className="text-[#00c96b]">pots</span>
        </div>
        <p className="text-gray-400 text-sm mb-8 text-center lg:text-left">
          {tab === "login" ? "Welcome back, Gaffer 👋" : "Start winning today 🏆"}
        </p>

        {/* Tabs */}
        <div className="flex border-2 border-gray-100 rounded-xl overflow-hidden mb-6">
          {(["login", "signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all duration-150 capitalize ${
                tab === t ? "bg-[#37003c] text-white" : "text-gray-400 hover:text-gray-600"
              }`}>
              {t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        {tab === "signup" && (
          <div className="mb-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
            <input className="fp-input" placeholder="Samuel Kofi" value={form.username} onChange={set("username")} onKeyDown={handleKeyDown} />
          </div>
        )}

        <div className="mb-3.5">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
          <input className="fp-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={handleKeyDown} />
        </div>

        <div className="mb-3.5">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Password</label>
          <input className="fp-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={handleKeyDown} />
        </div>

        {tab === "signup" && (
          <div className="mb-3.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">FPL Team ID</label>
            <input className="fp-input" placeholder="e.g. 4182739" value={form.fplTeamId} onChange={set("fplTeamId")} onKeyDown={handleKeyDown} />
            <p className="text-[11px] text-gray-400 mt-1.5">Find it at fantasy.premierleague.com → Points → share URL</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="btn-primary w-full mt-1 text-[15px] py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Please wait…" : tab === "login" ? "LOGIN →" : "CREATE ACCOUNT →"}
        </button>

        <p className="text-center text-[12px] text-gray-400 mt-5">
          {tab === "login"
            ? <>New here?{" "}<button onClick={() => setTab("signup")} className="text-[#37003c] font-bold hover:underline">Create an account</button></>
            : <>Already have an account?{" "}<button onClick={() => setTab("login")} className="text-[#37003c] font-bold hover:underline">Login</button></>
          }
        </p>

        <p className="text-center text-[11px] text-gray-300 mt-4">🔒 Secured by Firebase Auth · Payments by Paystack</p>
      </div>
    </div>
  );
}
