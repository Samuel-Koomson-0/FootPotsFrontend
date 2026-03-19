"use client";
// src/components/ui.tsx

import { useState, useEffect } from "react";
import { FplPlayer, FplTeam, Transaction, User } from "@/types";
import { ProfileModal } from "./ProfileModal";
import { NotificationsPanel, MOCK_NOTIFICATIONS } from "./NotificationsPanel";

// ─── JERSEY CONFIGS ───────────────────────────────────────────────────────────
const JERSEY: Record<string, { c1: string; c2: string; pat: "plain"|"stripe"|"half"|"band"; gk?: boolean }> = {
  ARS: { c1: "#ef0107", c2: "#ffffff", pat: "plain"  },
  CHE: { c1: "#034694", c2: "#ffffff", pat: "plain"  },
  MCI: { c1: "#6cabdd", c2: "#1c2c5b", pat: "stripe" },
  NEW: { c1: "#241f20", c2: "#ffffff", pat: "stripe" },
  LIV: { c1: "#c8102e", c2: "#f6eb61", pat: "plain"  },
  CRY: { c1: "#1b458f", c2: "#c4122e", pat: "half"   },
  NOT: { c1: "#dd0000", c2: "#ffffff", pat: "band"   },
  WOL: { c1: "#fdb913", c2: "#231f20", pat: "plain"  },
  SHU: { c1: "#ee2737", c2: "#ffffff", pat: "stripe" },
  BOU: { c1: "#da291c", c2: "#000000", pat: "stripe" },
  GK:  { c1: "#16a34a", c2: "#052e16", pat: "plain", gk: true },
};

// ─── JERSEY ICON ──────────────────────────────────────────────────────────────
export function JerseyIcon({ club, size = 48, captain, vice }: {
  club: string; size?: number; captain?: boolean; vice?: boolean;
}) {
  const j = JERSEY[club] ?? { c1: "#6b7280", c2: "#fff", pat: "plain" as const };
  const { c1, c2, pat, gk } = j;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 52 52">
        {gk ? (
          <>
            <rect x="10" y="6" width="32" height="30" rx="3" fill={c1} />
            <polygon points="10,6 4,12 4,22 10,20" fill={c1} />
            <polygon points="42,6 48,12 48,22 42,20" fill={c1} />
            <rect x="10" y="6" width="32" height="9" fill={c2} opacity="0.35" />
            <rect x="19" y="36" width="5" height="10" rx="2" fill={c1} />
            <rect x="28" y="36" width="5" height="10" rx="2" fill={c1} />
          </>
        ) : (
          <>
            <polygon points="10,8 10,36 42,36 42,8 34,4 26,8 18,4" fill={c1} />
            <polygon points="10,8 4,16 4,24 10,22" fill={c1} />
            <polygon points="42,8 48,16 48,24 42,22" fill={c1} />
            {pat === "stripe" && <>
              <rect x="19" y="4" width="5" height="32" fill={c2} opacity="0.45" />
              <rect x="28" y="4" width="5" height="32" fill={c2} opacity="0.45" />
            </>}
            {pat === "half" && <polygon points="26,8 42,4 42,36 26,36" fill={c2} opacity="0.38" />}
            {pat === "band" && <rect x="10" y="15" width="32" height="9" fill={c2} opacity="0.38" />}
            <polygon points="18,4 10,8 18,12 26,8" fill={c2} opacity="0.28" />
            <rect x="19" y="36" width="5" height="10" rx="2" fill={c1} />
            <rect x="28" y="36" width="5" height="10" rx="2" fill={c1} />
          </>
        )}
      </svg>
      {captain && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#37003c] flex items-center justify-center text-[8px] font-black border border-white">C</div>
      )}
      {vice && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[8px] font-black border border-white">V</div>
      )}
    </div>
  );
}

// ─── PITCH PLAYER ─────────────────────────────────────────────────────────────
export function PitchPlayer({ player, isCaptain, isVice, mode = "points", small = false }: {
  player: FplPlayer; isCaptain?: boolean; isVice?: boolean;
  mode?: "points"|"price"; small?: boolean;
}) {
  const s = small ? 36 : 46;
  return (
    <div className="flex flex-col items-center" style={{ width: small ? 56 : 70 }}>
      <JerseyIcon club={player.club} size={s} captain={isCaptain} vice={isVice} />
      <div className="mt-1 bg-[#37003c] text-white rounded px-1.5 py-0.5 text-center font-bold leading-tight"
        style={{ fontSize: small ? 7 : 9, maxWidth: small ? 52 : 66, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {player.name.split(" ").pop()}
      </div>
      <div className="mt-0.5 rounded px-1.5 py-0.5 font-bold font-display leading-tight"
        style={{
          fontSize: small ? 7 : 8,
          background: mode === "price" ? "#00ff87" : "rgba(0,0,0,0.75)",
          color:      mode === "price" ? "#37003c" : "#00ff87",
        }}>
        {mode === "price" ? `£${player.price}m` : `${player.gwPoints}pts`}
      </div>
    </div>
  );
}

// ─── MINI PITCH ───────────────────────────────────────────────────────────────
export function MiniPitch({ team, mode = "points", small = false }: {
  team: FplTeam; mode?: "points"|"price"; small?: boolean;
}) {
  const rows: (keyof Pick<FplTeam,"gk"|"def"|"mid"|"fwd">)[] = ["gk","def","mid","fwd"];
  return (
    <div className="pitch-bg rounded-xl border-2 border-white/10 shadow-inner"
      style={{ padding: small ? "10px 4px 14px" : "16px 6px 20px" }}>
      {rows.map((row) => (
        <div key={row} className="flex justify-center gap-1 mb-1.5">
          {team[row].map((p) => (
            <PitchPlayer key={p.id} player={p}
              isCaptain={p.id === team.captain} isVice={p.id === team.viceCaptain}
              mode={mode} small={small} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── DEADLINE COUNTDOWN ───────────────────────────────────────────────────────
// TODO (Joshua): Replace GW30_DEADLINE with real value fetched from FPL API
// e.g. fetch from /api/fpl/deadlines and store in state at the app level
const GW30_DEADLINE = new Date("2025-04-05T11:30:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      diff,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function DeadlineBanner() {
  const [dismissed, setDismissed] = useState(false);
  const time = useCountdown(GW30_DEADLINE);
  if (dismissed || !time) return null;

  const isUrgent  = time.diff < 3 * 3600000;
  const isWarning = time.diff < 24 * 3600000;
  const bg     = isUrgent ? "#7f1d1d"  : isWarning ? "#78350f"  : "#1e3a5f";
  const accent = isUrgent ? "#fca5a5"  : isWarning ? "#fcd34d"  : "#93c5fd";
  const badge  = isUrgent ? "🔴"       : isWarning ? "⚠️"      : "⏰";
  const pad    = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-between px-4 py-2" style={{ background: bg }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] flex-shrink-0">{badge}</span>
        <span className="text-white text-[12px] font-bold">GW30 deadline</span>
        <span className="text-white/50 text-[11px] hidden sm:inline">· Set captain & transfers</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-0.5">
          {[{ v: pad(time.h), l: "h" }, { v: pad(time.m), l: "m" }, { v: pad(time.s), l: "s" }].map((t, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span className="font-display font-bold text-[14px] tabular-nums px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.12)", color: accent }}>
                {t.v}
              </span>
              <span className="text-white/40 text-[10px] mr-0.5">{t.l}</span>
            </span>
          ))}
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-white/40 hover:text-white/70 text-[18px] leading-none transition-opacity"
          aria-label="Dismiss">×</button>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
type NavPage = "groups" | "leaderboard" | "lineup";

const NAV_LINKS: { id: NavPage; label: string; icon: string }[] = [
  { id: "groups",      label: "Groups",      icon: "⚽" },
  { id: "leaderboard", label: "Leaderboard", icon: "📊" },
  { id: "lineup",      label: "My Team",     icon: "👕" },
];

interface NavBarProps {
  activePage: NavPage;
  balance: number;
  user: User;
  onNavigate: (page: NavPage) => void;
  onWalletClick: () => void;
  onLogout: () => void;
}

export function NavBar({ activePage, balance, user, onNavigate, onWalletClick, onLogout }: NavBarProps) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [notifs,      setNotifs]      = useState(MOCK_NOTIFICATIONS);

  const unread   = notifs.filter((n) => !n.read).length;
  const initials = user.username.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#37003c] shadow-lg">
        <div className="flex items-center justify-between h-14 px-4 sm:px-5">

          {/* Logo */}
          <span className="font-display text-[20px] sm:text-xl font-bold text-[#00ff87] tracking-wide">
            foot<span className="text-white">pots</span>
          </span>

          {/* Desktop nav links */}
          <div className="hidden sm:flex gap-0.5">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => onNavigate(l.id)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                  activePage === l.id
                    ? "bg-[#00ff87]/15 text-[#00ff87]"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Wallet */}
            <button onClick={onWalletClick}
              className="bg-[#00ff87] text-[#37003c] font-black text-[11px] sm:text-[12px] px-2.5 sm:px-3 py-1.5 rounded-full font-display tracking-wide hover:brightness-105 transition-all active:scale-95">
              GHS {balance.toFixed(0)}
            </button>

            {/* Bell */}
            <button onClick={() => setShowNotifs(true)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[#37003c]">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Avatar → Profile */}
            <button onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-[12px] text-[#37003c] hover:brightness-110 transition-all active:scale-95 flex-shrink-0"
              style={{ background: "#00ff87" }}
              aria-label="Profile">
              {initials}
            </button>

            {/* Hamburger — mobile only */}
            <button onClick={() => setMenuOpen((o) => !o)}
              className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu">
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-200 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-200 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-200 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/10 px-3 py-2 pb-3 bg-[#37003c]">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => { onNavigate(l.id); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                  activePage === l.id
                    ? "bg-[#00ff87]/15 text-[#00ff87]"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                }`}>
                <span className="text-lg">{l.icon}</span>
                {l.label}
                {activePage === l.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff87]" />}
              </button>
            ))}
          </div>
        )}

        {/* Deadline banner — sits directly under nav */}
        <DeadlineBanner />
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#37003c] border-t border-white/10 flex">
        {NAV_LINKS.map((l) => (
          <button key={l.id} onClick={() => onNavigate(l.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              activePage === l.id ? "text-[#00ff87]" : "text-white/35"
            }`}>
            <span className="text-[18px] leading-none">{l.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Profile modal */}
      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)}
          onLogout={() => { setShowProfile(false); onLogout(); }} />
      )}

      {/* Notifications panel */}
      {showNotifs && (
        <NotificationsPanel
          notifications={notifs}
          onClose={() => setShowNotifs(false)}
          onMarkAllRead={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
        />
      )}
    </>
  );
}

// ─── WALLET MODAL ─────────────────────────────────────────────────────────────
const TX_ICONS: Record<Transaction["type"], string> = {
  winnings: "🏆", entry: "🎯", deposit: "💳", withdrawal: "🏦",
};

export function WalletModal({ balance, transactions, onClose, onDeposit, onWithdraw }: {
  balance: number; transactions: Transaction[];
  onClose: () => void; onDeposit: () => void; onWithdraw: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="font-display text-2xl font-bold text-[#37003c] mb-4">My Wallet</h2>
        <div className="rounded-2xl p-5 sm:p-6 text-center mb-4"
          style={{ background: "linear-gradient(135deg, #37003c, #5a0060)" }}>
          <p className="text-[11px] tracking-widest text-white/50 uppercase mb-1">Available Balance</p>
          <p className="font-display text-[42px] sm:text-5xl font-bold text-[#00ff87] leading-none">
            GHS {balance.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-3 mb-5">
          <button onClick={onDeposit} className="flex-1 btn-green py-3 text-sm">Deposit</button>
          <button onClick={onWithdraw}
            className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-gray-200 text-gray-700 font-display tracking-wide hover:border-gray-300 transition-colors">
            Withdraw
          </button>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Transactions</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${tx.amount > 0 ? "bg-green-50" : "bg-red-50"}`}>
                  {TX_ICONS[tx.type]}
                </div>
                <div>
                  <p className="font-semibold text-[12px] sm:text-[13px]">{tx.description}</p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <span className={`font-display font-bold text-[14px] sm:text-[15px] flex-shrink-0 ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                {tx.amount > 0 ? "+" : ""}GHS {Math.abs(tx.amount)}
              </span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-primary w-full mt-5 text-[15px]">CLOSE</button>
      </div>
    </div>
  );
}