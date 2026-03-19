"use client";
// src/app/leaderboard/LeaderboardPage.tsx

import { useState, useEffect } from "react";
import { NavBar, WalletModal, MiniPitch } from "@/components/ui";
import { fetchLeaderboard, fetchFplTeam, fetchTransactions } from "@/lib/api";
import { LeaderboardEntry, FplTeam, Transaction, User } from "@/types";
import { AppPage } from "@/app/page";

interface Props {
  user: User;
  onNavigate: (page: AppPage) => void;
}

// Hardcoded for Phase 1 — active league context
const ACTIVE_LEAGUE = { id: "lg_001", name: "Premier Ballers", entryFee: 50, members: 8, gameweek: 29 };

export default function LeaderboardPage({ user, onNavigate }: Props) {
  const [entries, setEntries]           = useState<LeaderboardEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showWallet, setShowWallet]     = useState(false);
  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null);
  const [viewingTeam, setViewingTeam]   = useState<FplTeam | null>(null);
  const [teamLoading, setTeamLoading]   = useState(false);

  const prize = ACTIVE_LEAGUE.entryFee * ACTIVE_LEAGUE.members * 0.95; // after 5% commission

  useEffect(() => {
    Promise.all([
      fetchLeaderboard(ACTIVE_LEAGUE.id),
      fetchTransactions(user.id),
    ]).then(([lb, txs]) => {
      setEntries(lb);
      setTransactions(txs);
      setLoading(false);
    });
  }, [user.id]);

  const openLineup = async (entry: LeaderboardEntry) => {
    setViewingEntry(entry);
    setViewingTeam(null);
    setTeamLoading(true);
    // TODO (Joshua): fetchFplTeam will call your /api/fpl/team route
    const team = await fetchFplTeam(entry.fplTeamId);
    setViewingTeam(team);
    setTeamLoading(false);
  };

  const rankClass = (rank: number) => {
    if (rank === 1) return "text-amber-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "text-gray-400";
  };

  const rankLabel = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <>
      <NavBar
        activePage="leaderboard"
        balance={user.walletBalance}
        onNavigate={onNavigate}
        onWalletClick={() => setShowWallet(true)}
      />

      {/* Hero */}
      <div className="relative text-center overflow-hidden py-9 px-5"
        style={{ background: "linear-gradient(160deg, #37003c 0%, #4a0054 60%, #1a0020 100%)" }}>
        <div className="absolute -bottom-px left-0 right-0 h-8 bg-[#f2f4f2]"
          style={{ clipPath: "ellipse(62% 100% at 50% 100%)" }} />
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-[11px] tracking-[3px] uppercase text-white/40 mb-1">Winner Takes</p>
        <p className="font-display text-[56px] font-bold text-[#00ff87] leading-none">
          GHS {prize.toLocaleString()}
        </p>
        <p className="text-white/40 text-xs mt-2">
          {ACTIVE_LEAGUE.members} managers · GHS {ACTIVE_LEAGUE.entryFee} each · 5% platform fee
        </p>
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          <span className="text-xs text-white/60 bg-white/8 border border-white/10 rounded-full px-3 py-1">
            ⚽ GW{ACTIVE_LEAGUE.gameweek}
          </span>
          <span className="text-xs text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-3 py-1">
            🔴 Live
          </span>
          <span className="text-xs text-white/60 bg-white/8 border border-white/10 rounded-full px-3 py-1">
            {ACTIVE_LEAGUE.name}
          </span>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <h2 className="font-display text-2xl font-bold text-[#37003c] mb-4">Standings</h2>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/* Table head */}
          <div className="grid bg-gray-50 border-b-2 border-gray-100 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            style={{ gridTemplateColumns: "40px 1fr 76px 76px 90px" }}>
            <span className="text-center">#</span>
            <span>Manager</span>
            <span className="text-center">Total</span>
            <span className="text-center">GW{ACTIVE_LEAGUE.gameweek}</span>
            <span className="text-center">Lineup</span>
          </div>

          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center px-4 py-3.5 border-b border-gray-50">
                  <div className="w-7 h-7 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="w-12 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="w-12 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="w-16 h-8 rounded bg-gray-100 animate-pulse" />
                </div>
              ))
            : entries.map((entry) => {
                const isMe = entry.userId === user.id;
                return (
                  <div key={entry.userId}
                    className={`grid items-center px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50 ${
                      isMe ? "bg-[#00ff87]/5 border-l-2 border-l-[#00ff87]" : ""
                    }`}
                    style={{ gridTemplateColumns: "40px 1fr 76px 76px 90px" }}>

                    {/* Rank */}
                    <div className={`font-display text-xl font-bold text-center ${rankClass(entry.rank)}`}>
                      {rankLabel(entry.rank)}
                    </div>

                    {/* Manager */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#37003c] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {entry.username.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[13px] text-gray-900 leading-tight">
                          {entry.username}
                          {isMe && (
                            <span className="ml-1.5 text-[9px] bg-[#37003c]/8 text-[#37003c] font-bold rounded-full px-2 py-0.5">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400">FPL #{entry.fplTeamId}</p>
                      </div>
                    </div>

                    {/* Total pts */}
                    <div className="text-center">
                      <div className="font-display text-[22px] font-bold text-[#37003c]">{entry.totalPoints}</div>
                      <div className="text-[9px] text-gray-400">pts</div>
                    </div>

                    {/* GW pts */}
                    <div className="text-center">
                      <div className="font-semibold text-[14px] text-gray-700">{entry.gwPoints}</div>
                      <div className="text-[9px] text-gray-400">pts</div>
                    </div>

                    {/* Lineup button */}
                    <div className="text-center">
                      {isMe ? (
                        <button
                          onClick={() => onNavigate("lineup")}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                          My XI
                        </button>
                      ) : (
                        <button
                          onClick={() => openLineup(entry)}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border-2 border-gray-200 text-[#37003c] hover:bg-[#37003c] hover:text-white hover:border-[#37003c] transition-all">
                          View XI
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* View Lineup Modal */}
      {viewingEntry && (
        <div className="modal-overlay" onClick={() => setViewingEntry(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#37003c]">{viewingEntry.username}</h2>
                <p className="text-[12px] text-gray-400">FPL #{viewingEntry.fplTeamId}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1 text-[12px] font-bold font-display">
                {viewingEntry.gwPoints} GW pts
              </div>
            </div>

            {teamLoading ? (
              <div className="h-64 bg-green-900/20 rounded-xl animate-pulse" />
            ) : viewingTeam ? (
              <MiniPitch team={viewingTeam} small />
            ) : null}

            <button onClick={() => setViewingEntry(null)} className="btn-primary w-full mt-4 text-[15px]">
              CLOSE
            </button>
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
