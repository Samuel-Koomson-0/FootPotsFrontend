"use client";
// src/components/ProfileModal.tsx

import { useState } from "react";
import { User } from "@/types";

interface Props {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

type Tab = "profile" | "settings";

export function ProfileModal({ user, onClose, onLogout }: Props) {
  const [tab,         setTab]         = useState<Tab>("profile");
  const [editMode,    setEditMode]    = useState(false);
  const [username,    setUsername]    = useState(user.username);
  const [fplId,       setFplId]       = useState(user.fplTeamId);
  const [saved,       setSaved]       = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs,  setPushNotifs]  = useState(true);

  const handleSave = () => {
    // TODO (Joshua): update username + fplTeamId in Firestore users collection
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2200);
  };

  const initials = username.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Placeholder stats — replace with real aggregated data from Firestore
  const stats = [
    { label: "Pots Played", value: "12"      },
    { label: "Total Won",   value: "GHS 840" },
    { label: "Win Rate",    value: "33%"     },
    { label: "Best Rank",   value: "#1"      },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #37003c, #5a0060)" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[20px] font-bold text-[#37003c] leading-tight truncate">{username}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-gray-400">
              FPL ID: <span className="font-semibold text-[#37003c]">{fplId}</span>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-2 border-gray-100 rounded-xl overflow-hidden mb-5">
          {(["profile", "settings"] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setEditMode(false); }}
              className={`flex-1 py-2.5 text-[13px] font-bold capitalize transition-all ${
                tab === t ? "bg-[#37003c] text-white" : "text-gray-400 hover:text-gray-600"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB ══ */}
        {tab === "profile" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {stats.map((s, i) => (
                <div key={s.label} className="bg-gray-50 rounded-xl py-3 text-center border border-gray-100">
                  <p className="font-display font-bold text-[15px] leading-none"
                    style={{ color: i === 0 ? "#37003c" : i === 1 ? "#059669" : i === 2 ? "#f59e0b" : "#37003c" }}>
                    {s.value}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Editable fields */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Account Details</p>
              {!editMode && (
                <button onClick={() => setEditMode(true)}
                  className="text-[12px] font-bold text-[#37003c] hover:underline">
                  Edit
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "Display Name", val: username, set: setUsername, disabled: false },
                { label: "FPL Team ID",  val: fplId,    set: setFplId,    disabled: false },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    {f.label}
                  </label>
                  <input className="fp-input" value={f.val} disabled={!editMode}
                    onChange={(e) => f.set(e.target.value)}
                    style={{ background: editMode ? "white" : "#f9fafb", color: editMode ? "#111" : "#6b7280" }} />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Email</label>
                <input className="fp-input" value={user.email} disabled
                  style={{ background: "#f9fafb", color: "#9ca3af" }} />
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => { setEditMode(false); setUsername(user.username); setFplId(user.fplTeamId); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-[13px] text-gray-500">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-[2] py-2.5 rounded-xl bg-[#37003c] text-white font-display font-bold text-[14px] tracking-wide">
                  {saved ? "✓ Saved!" : "SAVE CHANGES"}
                </button>
              </div>
            )}

            {/* Recent activity */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Activity</p>
            <div className="flex flex-col">
              {[
                { icon: "🏆", text: "Won GW28 · Premier Ballers", sub: "Mar 11", col: "#059669" },
                { icon: "🎯", text: "Joined The Gaffer Elite",     sub: "Mar 4",  col: "#37003c" },
                { icon: "📊", text: "Ranked #1 in GW27",           sub: "Mar 4",  col: "#f59e0b" },
                { icon: "💳", text: "Deposited GHS 200",           sub: "Feb 28", col: "#37003c" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] flex-shrink-0"
                    style={{ background: `${a.col}14` }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{a.text}</p>
                    <p className="text-[11px] text-gray-400">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {tab === "settings" && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Preferences</p>
            <div className="flex flex-col gap-2 mb-5">
              {[
                { label: "Email Notifications", sub: "GW results, pot updates",    val: emailNotifs, set: setEmailNotifs, disabled: false },
                { label: "Push Notifications",  sub: "Deadline reminders, wins",   val: pushNotifs,  set: setPushNotifs,  disabled: false },
                { label: "Dark Mode",           sub: "Coming soon",                 val: false,       set: () => {},       disabled: true  },
              ].map((row) => (
                <div key={row.label}
                  className="flex items-center justify-between px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className={`font-semibold text-[13px] ${row.disabled ? "text-gray-400" : "text-gray-800"}`}>
                      {row.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{row.sub}</p>
                  </div>
                  <button
                    disabled={row.disabled}
                    onClick={() => !row.disabled && row.set(!row.val)}
                    className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{ background: row.val && !row.disabled ? "#37003c" : "#e5e7eb" }}
                  >
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
                      style={{ left: row.val && !row.disabled ? "22px" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Account</p>
            <div className="flex flex-col gap-2 mb-5">
              {[
                { label: "Change Password",  icon: "🔒" },
                { label: "Payment Methods",  icon: "💳" },
                { label: "Privacy Policy",   icon: "📄" },
                { label: "Terms of Service", icon: "📋" },
                { label: "Help & Support",   icon: "💬" },
              ].map((item) => (
                <button key={item.label}
                  className="flex items-center justify-between px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors text-left w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px]">{item.icon}</span>
                    <span className="font-semibold text-[13px] text-gray-800">{item.label}</span>
                  </div>
                  <span className="text-gray-300 text-[14px]">›</span>
                </button>
              ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Danger Zone</p>
              <button className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors">
                Delete Account
              </button>
            </div>
          </>
        )}

        {/* Logout */}
        <button onClick={onLogout}
          className="w-full py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold text-[14px] font-display hover:bg-red-50 transition-colors mb-2">
          Log Out
        </button>
        <button onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#37003c] text-white font-display font-bold text-[15px] tracking-wide">
          CLOSE
        </button>
      </div>
    </div>
  );
}