"use client";
// src/app/lineup/LineupPage.tsx

import { useState, useEffect, useCallback } from "react";
import { NavBar, WalletModal, JerseyIcon } from "@/components/ui";
import { fetchFplTeam, fetchTransactions, TRANSFER_POOL } from "@/lib/api";
import { FplTeam, FplPlayer, Transaction, User } from "@/types";
import { AppPage } from "@/app/page";

interface Props {
  user: User;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

type ViewMode   = "points" | "price";
type ActionMode = "none" | "swap" | "captain" | "vice";

const FORMATIONS = ["4-3-3","4-4-2","4-5-1","3-4-3","3-5-2","5-3-2","5-4-1"] as const;
type Formation = typeof FORMATIONS[number];

function parseFormation(f: Formation): [number, number, number] {
  const p = f.split("-").map(Number);
  return [p[0], p[1], p[2]];
}

function PlayerRow({ player, selected, accentColor = "#37003c", right, onClick }: {
  player: FplPlayer; selected?: boolean; accentColor?: string;
  right?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all border-2"
      style={{
        borderColor: selected ? accentColor : "transparent",
        background:  selected ? `${accentColor}0d` : "#f9fafb",
        cursor: onClick ? "pointer" : "default",
      }}>
      <div className="flex items-center gap-2.5">
        <JerseyIcon club={player.club} size={30} />
        <div>
          <p className="font-semibold text-[13px] text-gray-900 leading-tight">{player.name}</p>
          <p className="text-[11px] text-gray-400">{player.club} · {player.position}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
    </div>
  );
}

export default function LineupPage({ user, onNavigate, onLogout }: Props) {
  const [team,         setTeam]         = useState<FplTeam | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [mode,       setMode]       = useState<ViewMode>("points");
  const [formation,  setFormation]  = useState<Formation>("4-3-3");
  const [actionMode, setActionMode] = useState<ActionMode>("none");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saved,      setSaved]      = useState(false);

  const [showWallet,    setShowWallet]    = useState(false);
  const [showTransfer,  setShowTransfer]  = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [showCaptain,   setShowCaptain]   = useState(false);
  const [outPlayer,     setOutPlayer]     = useState<FplPlayer | null>(null);
  const [inPlayer,      setInPlayer]      = useState<FplPlayer | null>(null);

  useEffect(() => {
    Promise.all([
      fetchFplTeam(user.fplTeamId),
      fetchTransactions(user.id),
    ]).then(([t, txs]) => {
      setTeam(t); setTransactions(txs); setLoading(false);
    });
  }, [user.fplTeamId, user.id]);

  const starters = team ? [...team.gk, ...team.def, ...team.mid, ...team.fwd] : [];
  const gwPts    = starters.reduce((s, p) => s + p.gwPoints, 0);
  const budget   = 99.5; // TODO (Joshua): derive from FPL API

  const [dCount, mCount, fCount] = parseFormation(formation);
  const pitchRows: FplPlayer[][] = team ? [
    team.gk,
    team.def.slice(0, dCount),
    team.mid.slice(0, mCount),
    team.fwd.slice(0, fCount),
  ] : [[], [], [], []];

  const poolForPos = outPlayer
    ? TRANSFER_POOL.filter((p) => p.position === outPlayer.position)
    : [];

  const handleTileTap = useCallback((playerId: number) => {
    if (!team) return;
    if (actionMode === "captain") {
      if (playerId !== team.viceCaptain) setTeam((p) => p ? { ...p, captain: playerId } : p);
      setActionMode("none"); setSelectedId(null); return;
    }
    if (actionMode === "vice") {
      if (playerId !== team.captain) setTeam((p) => p ? { ...p, viceCaptain: playerId } : p);
      setActionMode("none"); setSelectedId(null); return;
    }
    if (actionMode === "swap") {
      if (selectedId === null) { setSelectedId(playerId); return; }
      if (selectedId === playerId) { setSelectedId(null); return; }
      const allP = [...starters, ...team.bench];
      const a = allP.find((p) => p.id === selectedId)!;
      const b = allP.find((p) => p.id === playerId)!;
      if (!a || !b) { setSelectedId(null); return; }
      if ((a.position === "GK") !== (b.position === "GK")) { setSelectedId(null); return; }
      const swapIn = (arr: FplPlayer[]) => arr.map((p) => p.id === a.id ? b : p.id === b.id ? a : p);
      setTeam((prev) => prev ? { ...prev, gk: swapIn(prev.gk), def: swapIn(prev.def), mid: swapIn(prev.mid), fwd: swapIn(prev.fwd), bench: swapIn(prev.bench) } : prev);
      setSelectedId(null); setActionMode("none");
    }
  }, [actionMode, selectedId, starters, team]);

  if (loading || !team) {
    return (
      <>
        <NavBar activePage="lineup" balance={user.walletBalance} user={user}
          onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} onLogout={onLogout} />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse mb-4 w-48" />
          <div className="h-[520px] bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </>
    );
  }

  const confirmTransfer = () => {
    if (!outPlayer || !inPlayer) return;
    // TODO (Joshua): persist transfer via FPL API or Firestore
    const swap = (arr: FplPlayer[]) => arr.map((p) => p.id === outPlayer.id ? { ...inPlayer, id: outPlayer.id } : p);
    setTeam((prev) => prev ? { ...prev, gk: swap(prev.gk), def: swap(prev.def), mid: swap(prev.mid), fwd: swap(prev.fwd) } : prev);
    setOutPlayer(null); setInPlayer(null); setShowTransfer(false);
  };

  const saveLineup = () => {
    // TODO (Joshua): persist captain, viceCaptain, formation to Firestore
    setSaved(true); setActionMode("none"); setSelectedId(null);
    setTimeout(() => setSaved(false), 2500);
  };

  const PitchTile = ({ p, size = "lg" }: { p: FplPlayer; size?: "lg"|"sm" }) => {
    const isCaptain  = p.id === team.captain;
    const isVice     = p.id === team.viceCaptain;
    const isSelected = selectedId === p.id;
    const isTarget   = actionMode === "swap" && selectedId !== null && selectedId !== p.id;
    const jSize = size === "lg" ? 46 : 34;
    const tileW = size === "lg" ? 68 : 54;
    const nameFz = size === "lg" ? 9 : 7.5;
    const valFz  = size === "lg" ? 8 : 7;

    return (
      <div className="flex flex-col items-center gap-[3px] cursor-pointer select-none" style={{ width: tileW }}
        onClick={() => handleTileTap(p.id)}>
        <div style={{
          outline:       isSelected ? "3px solid #00ff87" : isTarget ? "2px dashed rgba(255,255,255,0.5)" : "none",
          outlineOffset: 2, borderRadius: 8,
          transform:     isSelected ? "scale(1.1)" : "scale(1)",
          transition:    "transform 0.15s",
        }}>
          <JerseyIcon club={p.club} size={jSize} captain={isCaptain} vice={isVice} />
        </div>
        <div className="rounded text-white font-display font-bold text-center truncate px-1.5"
          style={{ fontSize: nameFz, background: "#37003c", maxWidth: tileW - 4, lineHeight: "18px" }}>
          {p.name.split(" ").pop()}
        </div>
        <div className="rounded font-display font-bold text-center px-1.5"
          style={{ fontSize: valFz, lineHeight: "16px",
            background: mode === "price" ? "#00ff87" : "rgba(0,0,0,0.72)",
            color:      mode === "price" ? "#37003c" : "#00ff87" }}>
          {mode === "price" ? `£${p.price}m` : `${p.gwPoints}pts`}
        </div>
      </div>
    );
  };

  const actionHint =
    actionMode === "swap"    ? "Tap two players to swap · tap elsewhere to cancel" :
    actionMode === "captain" ? "Tap a player to set as captain" :
    actionMode === "vice"    ? "Tap a player to set as vice-captain" : "";

  return (
    <>
      <NavBar activePage="lineup" balance={user.walletBalance} user={user}
        onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} onLogout={onLogout} />

      <div className="max-w-lg mx-auto px-3 py-3 pb-24 w-full"
        onClick={() => { if (actionMode !== "none" && selectedId === null) setActionMode("none"); }}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-[22px] sm:text-2xl font-bold text-[#37003c]">Team Selection</h1>
          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-display font-bold text-[11px] sm:text-[12px] rounded-full px-2.5 sm:px-3 py-1">
            ⚽ GW29 · {gwPts}pts
          </span>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
          {[
            { val: `£${budget}m`, label: "Budget"    },
            { val: `${gwPts}`,    label: "GW Pts"    },
            { val: "1 left",      label: "Transfers" },
            { val: formation,     label: "Formation" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 py-2 sm:py-2.5 text-center">
              <div className="font-display text-[14px] sm:text-[17px] font-bold text-[#37003c]">{s.val}</div>
              <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
            {(["points","price"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-bold capitalize transition-all ${
                  mode === m ? "bg-[#37003c] text-white" : "text-gray-400 hover:text-gray-600"
                }`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFormation(true)}
            className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-[12px] sm:text-[13px] font-bold text-gray-600 hover:border-gray-300 transition-colors">
            ⊞ {formation}
          </button>
          <button onClick={() => { setActionMode(actionMode === "swap" ? "none" : "swap"); setSelectedId(null); }}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] sm:text-[13px] font-bold border-2 transition-all ${
              actionMode === "swap"
                ? "bg-[#37003c] text-white border-[#37003c]"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            ⇄ Swap
          </button>
          <button onClick={() => setShowCaptain(true)}
            className="flex items-center gap-1 bg-amber-50 border-2 border-amber-200 rounded-xl px-3 py-2 text-[12px] sm:text-[13px] font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            © Captain
          </button>
          <button onClick={() => { setShowTransfer(true); setOutPlayer(null); setInPlayer(null); }}
            className="flex items-center gap-1 bg-[#37003c] text-white border-2 border-[#37003c] rounded-xl px-3 py-2 text-[12px] sm:text-[13px] font-bold hover:bg-[#5a0060] transition-colors">
            ± Transfer
          </button>
        </div>

        {actionMode !== "none" && (
          <div className="bg-[#37003c] text-[#00ff87] text-center text-[12px] font-bold rounded-xl px-4 py-2.5 mb-3 animate-pulse">
            {actionHint}
          </div>
        )}

        {/* Pitch */}
        <div className="pitch-bg rounded-2xl border-2 border-white/10 shadow-xl relative overflow-hidden w-full"
          style={{ padding: "16px 2px 20px" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/[0.13] pointer-events-none" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.13] pointer-events-none" />
          {pitchRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 relative z-10">
              {row.map((p) => <PitchTile key={p.id} p={p} />)}
            </div>
          ))}
        </div>

        {/* Bench */}
        <div className="mt-3">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">— Bench —</p>
          <div className="bg-white rounded-2xl border border-gray-100 px-2 py-3 flex justify-center gap-2 sm:gap-3">
            {team.bench.map((p) => <PitchTile key={p.id} p={p} size="sm" />)}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-[#37003c] font-black text-[7px] flex items-center justify-center">C</span>
            Captain
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-4 h-4 rounded-full bg-gray-400 text-white font-black text-[7px] flex items-center justify-center">V</span>
            Vice
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-3.5 h-3.5 rounded border-2 border-[#00ff87]" />
            Selected
          </div>
        </div>

        {/* Save */}
        <button onClick={saveLineup}
          className={`w-full mt-4 py-3.5 rounded-2xl font-display font-bold text-[15px] tracking-wide transition-all duration-300 ${
            saved ? "bg-green-500 text-white" : "bg-[#37003c] text-white hover:bg-[#5a0060]"
          }`}>
          {saved ? "✓ Lineup Saved!" : "SAVE LINEUP"}
        </button>
      </div>

      {/* Formation Modal */}
      {showFormation && (
        <div className="modal-overlay" onClick={() => setShowFormation(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-1">Choose Formation</h2>
            <p className="text-sm text-gray-400 mb-5">Your lineup will rearrange to fit the selected shape.</p>
            <div className="grid grid-cols-2 gap-3">
              {FORMATIONS.map((f) => {
                const [d, m, fw] = parseFormation(f);
                const active = f === formation;
                return (
                  <button key={f} onClick={() => { setFormation(f); setShowFormation(false); }}
                    className={`flex flex-col items-center py-4 px-3 rounded-2xl border-2 transition-all ${
                      active ? "border-[#37003c] bg-[#37003c] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#37003c]/30"
                    }`}>
                    <div className="flex flex-col items-center gap-1.5 mb-2">
                      {[1, d, m, fw].map((count, ri) => (
                        <div key={ri} className="flex gap-1.5">
                          {Array.from({ length: count }).map((_, ci) => (
                            <div key={ci} className="w-2.5 h-2.5 rounded-full"
                              style={{ background: active ? "rgba(255,255,255,0.75)" : "#37003c", opacity: active ? 1 : 0.55 }} />
                          ))}
                        </div>
                      ))}
                    </div>
                    <span className="font-display font-bold text-[18px] leading-none">{f}</span>
                    <span className={`text-[10px] mt-1 ${active ? "text-white/60" : "text-gray-400"}`}>
                      {d} DEF · {m} MID · {fw} FWD
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowFormation(false)}
              className="w-full mt-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Captain Modal */}
      {showCaptain && (
        <div className="modal-overlay" onClick={() => setShowCaptain(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-1">Captain & Vice-Captain</h2>
            <p className="text-sm text-gray-400 mb-4">Captain scores double. Vice-captain doubles if captain doesn't play.</p>
            <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
              {starters.map((p) => {
                const isCap  = p.id === team.captain;
                const isVice = p.id === team.viceCaptain;
                return (
                  <div key={p.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                    style={{ borderColor: isCap ? "#f59e0b" : isVice ? "#9ca3af" : "transparent", background: isCap ? "#fefce8" : "#f9fafb" }}>
                    <div className="flex items-center gap-2.5">
                      <JerseyIcon club={p.club} size={32} />
                      <div>
                        <p className="font-semibold text-[13px] text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.club} · {p.gwPoints}pts GW</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { if (p.id !== team.viceCaptain) setTeam((prev) => prev ? { ...prev, captain: p.id } : prev); }}
                        className="w-8 h-8 rounded-full font-black text-[12px] border-2 transition-all"
                        style={{ background: isCap ? "#f59e0b" : "white", color: isCap ? "#37003c" : "#9ca3af", borderColor: isCap ? "#f59e0b" : "#e5e7eb" }}>
                        C
                      </button>
                      <button onClick={() => { if (p.id !== team.captain) setTeam((prev) => prev ? { ...prev, viceCaptain: p.id } : prev); }}
                        className="w-8 h-8 rounded-full font-black text-[12px] border-2 transition-all"
                        style={{ background: isVice ? "#9ca3af" : "white", color: isVice ? "white" : "#9ca3af", borderColor: isVice ? "#9ca3af" : "#e5e7eb" }}>
                        V
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowCaptain(false)}
              className="w-full mt-5 py-3.5 rounded-xl bg-[#37003c] text-white font-display font-bold text-[15px]">
              CONFIRM
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="modal-overlay" onClick={() => { setShowTransfer(false); setOutPlayer(null); setInPlayer(null); }}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-1">Make a Transfer</h2>
            <p className="text-sm text-gray-400 mb-4">Pick a player out, then select their replacement.</p>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your squad — tap to transfer out</p>
            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mb-4">
              {[...team.gk, ...team.def, ...team.mid, ...team.fwd, ...team.bench].map((p) => (
                <PlayerRow key={p.id} player={p} selected={outPlayer?.id === p.id} accentColor="#37003c"
                  onClick={() => { setOutPlayer(p); setInPlayer(null); }}
                  right={<>
                    <span className="text-[10px] font-bold bg-[#37003c]/[0.07] text-[#37003c] rounded-md px-1.5 py-0.5">{p.gwPoints}pts</span>
                    <span className="font-display font-bold text-[14px] text-[#37003c]">£{p.price}m</span>
                  </>} />
              ))}
            </div>

            {outPlayer && (<>
              <div className="text-center text-gray-300 text-xl mb-3">↕</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Replacements for {outPlayer.name} ({outPlayer.position})
              </p>
              <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mb-4">
                {poolForPos.map((p) => (
                  <PlayerRow key={p.id} player={p} selected={inPlayer?.id === p.id} accentColor="#16a34a"
                    onClick={() => setInPlayer(p)}
                    right={<>
                      <span className="text-[10px] font-bold bg-green-50 text-green-700 rounded-md px-1.5 py-0.5">{p.gwPoints}pts</span>
                      <span className="font-display font-bold text-[14px] text-[#37003c]">£{p.price}m</span>
                    </>} />
                ))}
              </div>
            </>)}

            <div className="flex gap-3">
              <button onClick={() => { setShowTransfer(false); setOutPlayer(null); setInPlayer(null); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600">Cancel</button>
              <button onClick={confirmTransfer} disabled={!outPlayer || !inPlayer}
                className="flex-[2] btn-primary text-[15px] disabled:opacity-40 disabled:cursor-not-allowed">
                CONFIRM TRANSFER
              </button>
            </div>
          </div>
        </div>
      )}

      {showWallet && (
        <WalletModal balance={user.walletBalance} transactions={transactions}
          onClose={() => setShowWallet(false)} onDeposit={() => {}} onWithdraw={() => {}} />
      )}
    </>
  );
}