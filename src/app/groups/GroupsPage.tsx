"use client";
// src/app/groups/GroupsPage.tsx

import { useState, useEffect } from "react";
import { NavBar, WalletModal } from "@/components/ui";
import { fetchLeagues, fetchTransactions, fetchUserLeagueIds, prizePool } from "@/lib/api";
import { League, User, Transaction } from "@/types";
import { AppPage } from "@/app/page";

interface Props {
  user: User;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

const MEMBER_COLORS = ["#37003c","#5a0060","#1e3a5f","#064e3b","#78350f","#7f1d1d"];

export default function GroupsPage({ user, onNavigate, onLogout }: Props) {
  const [leagues,      setLeagues]      = useState<League[]>([]);
  const [joinedIds,    setJoinedIds]    = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showWallet,   setShowWallet]   = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);
  const [confirmJoin,  setConfirmJoin]  = useState<League | null>(null);

  const [newLeague, setNewLeague] = useState({
    name: "", entryFee: "50", maxPlayers: "8", gameweek: "29",
  });

  useEffect(() => {
    Promise.all([
      fetchLeagues(),
      fetchUserLeagueIds(user.id),
      fetchTransactions(user.id),
    ]).then(([l, ids, txs]) => {
      setLeagues(l); setJoinedIds(ids); setTransactions(txs); setLoading(false);
    });
  }, [user.id]);

  const totalInPools = leagues
    .filter((l) => l.status !== "completed")
    .reduce((s, l) => s + prizePool(l), 0);

  const handleJoin = (league: League) => {
    if (joinedIds.includes(league.id)) {
      setJoinedIds((prev) => prev.filter((id) => id !== league.id));
    } else {
      setConfirmJoin(league);
    }
  };

  const confirmJoinLeague = () => {
    if (!confirmJoin) return;
    setJoinedIds((prev) => [...prev, confirmJoin.id]);
    setLeagues((prev) => prev.map((l) =>
      l.id === confirmJoin.id ? { ...l, currentPlayers: l.currentPlayers + 1 } : l
    ));
    setConfirmJoin(null);
    // TODO (Joshua): call joinLeague(confirmJoin.id, user.id) then redirect to Paystack
  };

  const handleCreate = () => {
    if (!newLeague.name.trim()) return;
    const created: League = {
      id: `lg_${Date.now()}`,
      name: newLeague.name,
      entryFee: Number(newLeague.entryFee),
      maxPlayers: Number(newLeague.maxPlayers),
      currentPlayers: 1,
      commission: 0.05,
      status: "open",
      gameweek: Number(newLeague.gameweek),
      createdAt: new Date().toISOString(),
    };
    setLeagues((prev) => [...prev, created]);
    setJoinedIds((prev) => [...prev, created.id]);
    setShowCreate(false);
    setNewLeague({ name: "", entryFee: "50", maxPlayers: "8", gameweek: "29" });
    // TODO (Joshua): call createLeague(created) to persist to Firestore
  };

  return (
    <>
      <NavBar
        activePage="groups"
        balance={user.walletBalance}
        user={user}
        onNavigate={onNavigate}
        onWalletClick={() => setShowWallet(true)}
        onLogout={onLogout}
      />

      {/* Hero */}
      <div className="relative overflow-hidden text-center py-8 sm:py-10 px-4 sm:px-5"
        style={{ background: "linear-gradient(135deg, #37003c 0%, #4a0052 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,135,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.03) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        <div className="absolute -bottom-px left-0 right-0 h-8 bg-[#f2f4f2]"
          style={{ clipPath: "ellipse(58% 100% at 50% 100%)" }} />
        <div className="relative z-10">
          <h1 className="font-display text-[32px] sm:text-4xl font-bold text-white leading-tight mb-2">
            Play FPL.<br /><span className="text-[#00ff87]">Win Real Money.</span>
          </h1>
          <p className="text-white/50 text-sm mb-6">Join a pot, pay your entry, top the leaderboard.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {[
              { val: `GHS ${totalInPools.toLocaleString()}`, label: "In active pools" },
              { val: "GW 30",                                label: "Current gameweek" },
              { val: `GHS ${user.walletBalance}`,            label: "Your balance"    },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 sm:px-5 py-2.5 text-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="font-display text-[20px] sm:text-2xl font-bold text-[#00ff87]">{s.val}</div>
                <div className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-5 sm:py-6 pb-24 sm:pb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#37003c]">Active Pots</h2>
          <button onClick={() => setShowCreate(true)}
            className="btn-green text-[13px] sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5">
            + Create Pot
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-60 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {leagues.map((league) => {
              const joined = joinedIds.includes(league.id);
              const pool   = prizePool(league);
              const pct    = Math.round((league.currentPlayers / league.maxPlayers) * 100);
              const full   = league.currentPlayers >= league.maxPlayers;

              return (
                <div key={league.id}
                  className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden card-hover cursor-pointer"
                  onClick={() => onNavigate("leaderboard")}>

                  {/* Card header */}
                  <div className="p-3.5 sm:p-4 pb-3" style={{ background: "linear-gradient(135deg, #37003c, #55006a)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-display text-lg sm:text-xl font-bold text-[#37003c] flex-shrink-0"
                        style={{ background: "#00ff87" }}>
                        {league.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-[14px] sm:text-[15px] leading-tight truncate">{league.name}</p>
                        <p className="text-white/40 text-[11px]">Gameweek {league.gameweek}</p>
                      </div>
                      {league.status === "active" && (
                        <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-bold text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-2 py-0.5">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00ff87] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>{league.currentPlayers}/{league.maxPlayers} managers</span>
                      <span>{full ? "Full" : `${league.maxPlayers - league.currentPlayers} left`}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3.5 sm:px-4 pt-3 pb-2">
                    <div className="flex divide-x divide-gray-100 mb-3">
                      <div className="flex-1 pr-3 sm:pr-4">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Entry Fee</p>
                        <p className="font-display text-[18px] sm:text-xl font-bold text-[#37003c]">GHS {league.entryFee}</p>
                      </div>
                      <div className="flex-1 pl-3 sm:pl-4">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Prize Pool</p>
                        <p className="font-display text-[18px] sm:text-xl font-bold text-green-600">GHS {pool}</p>
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      {Array.from({ length: Math.min(league.currentPlayers, 5) }).map((_, i) => (
                        <div key={i}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold flex-shrink-0"
                          style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length], marginLeft: i === 0 ? 0 : -8 }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {league.currentPlayers > 5 && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-gray-200 text-gray-500 flex items-center justify-center text-[9px] font-bold flex-shrink-0 -ml-2">
                          +{league.currentPlayers - 5}
                        </div>
                      )}
                      <span className="ml-2 text-[11px] text-gray-400">{league.currentPlayers} competing</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoin(league); }}
                      disabled={full && !joined}
                      className={`w-full py-2.5 rounded-xl font-bold text-[13px] font-display tracking-wide transition-all duration-150 ${
                        joined
                          ? "bg-green-50 text-green-700 border-2 border-green-200"
                          : full
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#37003c] text-white hover:bg-[#5a0060]"
                      }`}>
                      {joined ? `✓ Joined · GHS ${league.entryFee} paid` : full ? "Full" : `Join & Pay GHS ${league.entryFee}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Pot Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-1">Create New Pot</h2>
            <p className="text-sm text-gray-400 mb-5">You'll be the first member and pay the entry fee.</p>
            {[
              { label: "Pot Name",        key: "name",     type: "text",   placeholder: "e.g. Accra FPL Kings" },
              { label: "Entry Fee (GHS)", key: "entryFee", type: "number", placeholder: "50" },
            ].map((f) => (
              <div key={f.key} className="mb-4">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{f.label}</label>
                <input className="fp-input" type={f.type} placeholder={f.placeholder}
                  value={newLeague[f.key as keyof typeof newLeague]}
                  onChange={(e) => setNewLeague((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Max Players</label>
              <select className="fp-input" value={newLeague.maxPlayers}
                onChange={(e) => setNewLeague((p) => ({ ...p, maxPlayers: e.target.value }))}>
                {["4","6","8","10","12"].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Gameweek</label>
              <select className="fp-input" value={newLeague.gameweek}
                onChange={(e) => setNewLeague((p) => ({ ...p, gameweek: e.target.value }))}>
                {["29","30","31","32","33"].map((g) => <option key={g}>GW{g}</option>)}
              </select>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[13px] text-green-700 mb-5">
              💡 Your wallet will be charged <strong>GHS {newLeague.entryFee}</strong> when the pot fills and starts.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="flex-[2] btn-primary text-[15px]">CREATE POT</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Join Modal */}
      {confirmJoin && (
        <div className="modal-overlay" onClick={() => setConfirmJoin(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-2xl font-bold text-[#37003c] mb-4">Confirm Entry</h2>
            <div className="rounded-2xl p-5 sm:p-6 text-center mb-5"
              style={{ background: "linear-gradient(135deg, #37003c, #55006a)" }}>
              <p className="text-white/50 text-sm mb-1">Joining</p>
              <p className="font-display text-2xl font-bold text-white mb-3">{confirmJoin.name}</p>
              <p className="font-display text-[44px] sm:text-5xl font-bold text-[#00ff87] leading-none">
                GHS {confirmJoin.entryFee}
              </p>
              <p className="text-white/40 text-xs mt-2">will be deducted from your wallet</p>
            </div>
            <p className="text-center text-sm text-gray-500 mb-5">
              Prize pool becomes{" "}
              <strong className="text-green-600">
                GHS {prizePool({ ...confirmJoin, currentPlayers: confirmJoin.currentPlayers + 1 })}
              </strong>{" "}
              after you join
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmJoin(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600">Cancel</button>
              <button onClick={confirmJoinLeague} className="flex-[2] btn-primary text-[15px]">CONFIRM & PAY</button>
            </div>
          </div>
        </div>
      )}

      {showWallet && (
        <WalletModal balance={user.walletBalance} transactions={transactions}
          onClose={() => setShowWallet(false)}
          onDeposit={() => {/* TODO (Joshua): initiateDeposit */}}
          onWithdraw={() => {/* TODO (Joshua): withdrawal flow */}} />
      )}
    </>
  );
}