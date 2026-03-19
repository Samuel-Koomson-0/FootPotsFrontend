"use client";
// src/components/ui.tsx
// Shared components used across pages

import { useState } from "react";
import { FplPlayer, FplTeam, Transaction } from "@/types";

// ─── JERSEY CONFIGS ───────────────────────────────────────────────────────────
const JERSEY: Record<string, { c1: string; c2: string; pat: "plain" | "stripe" | "half" | "band"; gk?: boolean }> = {
  ARS: { c1: "#ef0107", c2: "#ffffff", pat: "plain" },
  CHE: { c1: "#034694", c2: "#ffffff", pat: "plain" },
  MCI: { c1: "#6cabdd", c2: "#1c2c5b", pat: "stripe" },
  NEW: { c1: "#241f20", c2: "#ffffff", pat: "stripe" },
  LIV: { c1: "#c8102e", c2: "#f6eb61", pat: "plain" },
  CRY: { c1: "#1b458f", c2: "#c4122e", pat: "half" },
  NOT: { c1: "#dd0000", c2: "#ffffff", pat: "band" },
  WOL: { c1: "#fdb913", c2: "#231f20", pat: "plain" },
  SHU: { c1: "#ee2737", c2: "#ffffff", pat: "stripe" },
  BOU: { c1: "#da291c", c2: "#000000", pat: "stripe" },
  GK:  { c1: "#16a34a", c2: "#052e16", pat: "plain", gk: true },
};

interface JerseyIconProps {
  club: string;
  size?: number;
  captain?: boolean;
  vice?: boolean;
}

export function JerseyIcon({ club, size = 48, captain, vice }: JerseyIconProps) {
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
            {pat === "stripe" && (
              <>
                <rect x="19" y="4" width="5" height="32" fill={c2} opacity="0.45" />
                <rect x="28" y="4" width="5" height="32" fill={c2} opacity="0.45" />
              </>
            )}
            {pat === "half" && (
              <polygon points="26,8 42,4 42,36 26,36" fill={c2} opacity="0.38" />
            )}
            {pat === "band" && (
              <rect x="10" y="15" width="32" height="9" fill={c2} opacity="0.38" />
            )}
            <polygon points="18,4 10,8 18,12 26,8" fill={c2} opacity="0.28" />
            <rect x="19" y="36" width="5" height="10" rx="2" fill={c1} />
            <rect x="28" y="36" width="5" height="10" rx="2" fill={c1} />
          </>
        )}
      </svg>

      {captain && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#37003c] flex items-center justify-center text-[8px] font-black border border-white">
          C
        </div>
      )}
      {vice && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[8px] font-black border border-white">
          V
        </div>
      )}
    </div>
  );
}

// ─── PITCH PLAYER CARD ────────────────────────────────────────────────────────
interface PitchPlayerProps {
  player: FplPlayer;
  isCaptain?: boolean;
  isVice?: boolean;
  mode?: "points" | "price";
  small?: boolean;
}

export function PitchPlayer({ player, isCaptain, isVice, mode = "points", small = false }: PitchPlayerProps) {
  const s = small ? 36 : 46;
  return (
    <div className="flex flex-col items-center" style={{ width: small ? 56 : 70 }}>
      <JerseyIcon club={player.club} size={s} captain={isCaptain} vice={isVice} />
      <div className="mt-1 bg-[#37003c] text-white rounded px-1.5 py-0.5 text-center font-bold leading-tight"
        style={{ fontSize: small ? 7 : 9, maxWidth: small ? 52 : 66, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {player.name.split(" ").pop()}
      </div>
      <div className={`mt-0.5 rounded px-1.5 py-0.5 font-bold font-display leading-tight`}
        style={{
          fontSize: small ? 7 : 8,
          background: mode === "price" ? "#00ff87" : "rgba(0,0,0,0.75)",
          color: mode === "price" ? "#37003c" : "#00ff87",
        }}>
        {mode === "price" ? `£${player.price}m` : `${player.gwPoints}pts`}
      </div>
    </div>
  );
}

// ─── MINI PITCH (for modal/leaderboard lineup view) ───────────────────────────
interface MiniPitchProps {
  team: FplTeam;
  mode?: "points" | "price";
  small?: boolean;
}

export function MiniPitch({ team, mode = "points", small = false }: MiniPitchProps) {
  const rows: (keyof Pick<FplTeam, "gk" | "def" | "mid" | "fwd">)[] = ["gk", "def", "mid", "fwd"];
  return (
    <div className="pitch-bg rounded-xl border-2 border-white/10 shadow-inner"
      style={{ padding: small ? "10px 4px 14px" : "16px 6px 20px" }}>
      {rows.map((row) => (
        <div key={row} className="flex justify-center gap-1 mb-1.5">
          {team[row].map((p) => (
            <PitchPlayer
              key={p.id}
              player={p}
              isCaptain={p.id === team.captain}
              isVice={p.id === team.viceCaptain}
              mode={mode}
              small={small}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
interface NavBarProps {
  activePage: "groups" | "leaderboard" | "lineup";
  balance: number;
  onNavigate: (page: "groups" | "leaderboard" | "lineup") => void;
  onWalletClick: () => void;
}

export function NavBar({ activePage, balance, onNavigate, onWalletClick }: NavBarProps) {
  const links: { id: "groups" | "leaderboard" | "lineup"; label: string }[] = [
    { id: "groups",      label: "Groups" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "lineup",      label: "My Team" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#37003c] flex items-center justify-between px-5 h-14 shadow-lg">
      <span className="font-display text-xl font-bold text-[#00ff87] tracking-wide">
        foot<span className="text-white">pots</span>
      </span>

      <div className="flex gap-0.5">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => onNavigate(l.id)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
              activePage === l.id
                ? "bg-[#00ff87]/15 text-[#00ff87]"
                : "text-white/60 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        onClick={onWalletClick}
        className="bg-[#00ff87] text-[#37003c] font-black text-sm px-4 py-1.5 rounded-full font-display tracking-wide hover:brightness-105 transition-all"
      >
        GHS {balance.toFixed(2)}
      </button>
    </nav>
  );
}

// ─── WALLET MODAL ─────────────────────────────────────────────────────────────
interface WalletModalProps {
  balance: number;
  transactions: Transaction[];
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const TX_ICONS: Record<Transaction["type"], string> = {
  winnings:   "🏆",
  entry:      "🎯",
  deposit:    "💳",
  withdrawal: "🏦",
};

export function WalletModal({ balance, transactions, onClose, onDeposit, onWithdraw }: WalletModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="font-display text-2xl font-bold text-[#37003c] mb-4">My Wallet</h2>

        {/* Balance card */}
        <div className="rounded-2xl p-6 text-center mb-4"
          style={{ background: "linear-gradient(135deg, #37003c, #5a0060)" }}>
          <p className="text-[11px] tracking-widest text-white/50 uppercase mb-1">Available Balance</p>
          <p className="font-display text-5xl font-bold text-[#00ff87] leading-none">
            GHS {balance.toFixed(2)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-5">
          <button onClick={onDeposit} className="flex-1 btn-green py-3 text-sm">Deposit</button>
          <button onClick={onWithdraw}
            className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-gray-200 text-gray-700 font-display tracking-wide hover:border-gray-300 transition-colors">
            Withdraw
          </button>
        </div>

        {/* Transactions */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Transactions</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                  tx.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}>
                  {TX_ICONS[tx.type]}
                </div>
                <div>
                  <p className="font-semibold text-[13px]">{tx.description}</p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <span className={`font-display font-bold text-[15px] ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
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
