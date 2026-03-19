"use client";
// src/app/lineup/LineupPage.tsx

import { useState, useEffect } from "react";
import { NavBar, WalletModal, JerseyIcon } from "@/components/ui";
import { fetchFplTeam, fetchTransactions, TRANSFER_POOL } from "@/lib/api";
import { FplTeam, FplPlayer, Transaction, User } from "@/types";
import { AppPage } from "@/app/page";

interface Props {
  user: User;
  onNavigate: (page: AppPage) => void;
}

type ViewMode = "points" | "price";

export default function LineupPage({ user, onNavigate }: Props) {
  const [team, setTeam]               = useState<FplTeam | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [mode, setMode]               = useState<ViewMode>("points");
  const [showWallet, setShowWallet]   = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [outPlayer, setOutPlayer]     = useState<FplPlayer | null>(null);
  const [inPlayer, setInPlayer]       = useState<FplPlayer | null>(null);

  useEffect(() => {
    Promise.all([
      fetchFplTeam(user.fplTeamId),
      fetchTransactions(user.id),
    ]).then(([t, txs]) => {
      setTeam(t);
      setTransactions(txs);
      setLoading(false);
    });
  }, [user.fplTeamId, user.id]);

  if (loading || !team) {
    return (
      <>
        <NavBar activePage="lineup" balance={user.walletBalance} onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse mb-4 w-48" />
          <div className="h-[520px] bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </>
    );
  }

  const starters = [...team.gk, ...team.def, ...team.mid, ...team.fwd];
  const gwPts    = starters.reduce((s, p) => s + p.gwPoints, 0);
  const budget   = 99.5; // TODO (Joshua): derive from FPL API

  const poolForPos = outPlayer
    ? TRANSFER_POOL.filter((p) => p.position === outPlayer.position)
    : [];

  const confirmTransfer = () => {
    if (!outPlayer || !inPlayer) return;
    // TODO (Joshua): persist transfer via FPL API or store in Firestore
    // For now: swap in local state
    const swap = (arr: FplPlayer[]) =>
      arr.map((p) => (p.id === outPlayer.id ? { ...inPlayer, id: outPlayer.id } : p));

    setTeam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gk:  swap(prev.gk),
        def: swap(prev.def),
        mid: swap(prev.mid),
        fwd: swap(prev.fwd),
      };
    });
    setOutPlayer(null);
    setInPlayer(null);
    setShowTransfer(false);
  };

  const PitchRow = ({ players }: { players: FplPlayer[] }) => (
    <div className="flex justify-center gap-1 mb-2 relative z-10">
      {players.map((p) => {
        const isCaptain = p.id === team.captain;
        const isVice    = p.id === team.viceCaptain;
        return (
          <div key={p.id} className="flex flex-col items-center" style={{ width: 72 }}>
            <JerseyIcon club={p.club} size={46} captain={isCaptain} vice={isVice} />
            <div className="mt-1 bg-[#37003c] text-white rounded px-1.5 py-0.5 text-center font-bold leading-tight"
              style={{ fontSize: 9, maxWidth: 68, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {p.name.split(" ").pop()}
            </div>
            <div className="mt-0.5 rounded px-1.5 py-0.5 font-bold font-display leading-tight text-[8px]"
              style={{
                background: mode === "price" ? "#00ff87" : "rgba(0,0,0,0.75)",
                color: mode === "price" ? "#37003c" : "#00ff87",
              }}>
              {mode === "price" ? `£${p.price}m` : `${p.gwPoints}pts`}
            </div>
          </div>
        );
      })}
    </div>
  );

  const BenchPlayer = ({ p }: { p: FplPlayer }) => (
    <div className="flex flex-col items-center" style={{ width: 58 }}>
      <JerseyIcon club={p.club} size={36} />
      <div className="mt-1 bg-[#37003c]/80 text-white rounded px-1 py-0.5 text-center font-bold leading-tight"
        style={{ fontSize: 7.5, maxWidth: 54, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {p.name.split(" ").pop()}
      </div>
      <div className="mt-0.5 rounded px-1 py-0.5 font-bold font-display leading-tight text-[7px]"
        style={{
          background: mode === "price" ? "#00ff87" : "rgba(0,0,0,0.65)",
          color: mode === "price" ? "#37003c" : "#00c96b",
        }}>
        {mode === "price" ? `£${p.price}m` : `${p.gwPoints}pts`}
      </div>
    </div>
  );

  return (
    <>
      <NavBar activePage="lineup" balance={user.walletBalance} onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} />

      <div className="max-w-lg mx-auto px-3.5 py-4 pb-20">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold text-[#37003c]">My Team</h1>
          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-display font-bold text-[12px] rounded-full px-3 py-1">
            ⚽ GW29 · {gwPts} pts
          </span>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { val: `£${budget}m`, label: "Budget" },
            { val: `${gwPts}`,   label: "GW Pts" },
            { val: "1",          label: "Transfers" },
            { val: "#1",         label: "Rank" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 py-2.5 text-center">
              <div className="font-display text-[18px] font-bold text-[#37003c]">{s.val}</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-3">
          <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
            {(["points","price"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 text-[13px] font-bold transition-all capitalize ${
                  mode === m ? "bg-[#37003c] text-white" : "text-gray-400 hover:text-gray-700"
                }`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTransfer(true)}
            className="btn-primary flex-1 text-[13px] py-2">
            ⇄ Transfers
          </button>
        </div>

        {/* PITCH */}
        <div className="pitch-bg rounded-2xl border-2 border-white/10 shadow-xl relative overflow-hidden"
          style={{ padding: "18px 4px 22px" }}>
          {/* Centre circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/12 pointer-events-none" />
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/12 pointer-events-none" />

          <PitchRow players={team.gk} />
          <PitchRow players={team.def} />
          <PitchRow players={team.mid} />
          <PitchRow players={team.fwd} />
        </div>

        {/* BENCH */}
        <div className="mt-3">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">— Bench —</p>
          <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 flex justify-center gap-3">
            {team.bench.map((p) => <BenchPlayer key={p.id} p={p} />)}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="modal-overlay" onClick={() => { setShowTransfer(false); setOutPlayer(null); setInPlayer(null); }}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-1">Make a Transfer</h2>
            <p className="text-sm text-gray-400 mb-4">Pick a player out, then select their replacement.</p>

            {/* OUT list */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your squad — tap to transfer out</p>
            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mb-4">
              {starters.map((p) => (
                <div key={p.id}
                  onClick={() => { setOutPlayer(p); setInPlayer(null); }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2 ${
                    outPlayer?.id === p.id
                      ? "border-[#37003c] bg-[#37003c]/5"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <JerseyIcon club={p.club} size={30} />
                    <div>
                      <p className="font-semibold text-[13px]">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.club} · {p.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#37003c]/8 text-[#37003c] rounded-md px-1.5 py-0.5">
                      {p.gwPoints}pts
                    </span>
                    <span className="font-display font-bold text-[14px] text-[#37003c]">£{p.price}m</span>
                  </div>
                </div>
              ))}
            </div>

            {/* IN list */}
            {outPlayer && (
              <>
                <div className="text-center text-gray-300 text-xl mb-3">↕</div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Replacements for {outPlayer.name} ({outPlayer.position})
                </p>
                <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto mb-4">
                  {poolForPos.map((p) => (
                    <div key={p.id}
                      onClick={() => setInPlayer(p)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2 ${
                        inPlayer?.id === p.id
                          ? "border-green-500 bg-green-50"
                          : "border-transparent bg-gray-50 hover:bg-gray-100"
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <JerseyIcon club={p.club} size={30} />
                        <div>
                          <p className="font-semibold text-[13px]">{p.name}</p>
                          <p className="text-[11px] text-gray-400">{p.club} · {p.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-green-50 text-green-700 rounded-md px-1.5 py-0.5">
                          {p.gwPoints}pts
                        </span>
                        <span className="font-display font-bold text-[14px] text-[#37003c]">£{p.price}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowTransfer(false); setOutPlayer(null); setInPlayer(null); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600">
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                disabled={!outPlayer || !inPlayer}
                className="flex-[2] btn-primary text-[15px] disabled:opacity-40 disabled:cursor-not-allowed">
                CONFIRM TRANSFER
              </button>
            </div>
          </div>
        </div>
      )}

      {showWallet && (
        <WalletModal
          balance={user.walletBalance}
          transactions={transactions}
          onClose={() => setShowWallet(false)}
          onDeposit={() => {}}
          onWithdraw={() => {}}
        />
      )}
    </>
  );
}
