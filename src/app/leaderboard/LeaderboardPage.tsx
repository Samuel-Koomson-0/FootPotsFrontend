"use client";
// src/app/leaderboard/LeaderboardPage.tsx

import { useState, useEffect } from "react";
import { NavBar, WalletModal, MiniPitch } from "@/components/ui";
import { fetchLeaderboard, fetchLeagues, fetchFplTeam, fetchTransactions, fetchUserLeagueIds, prizePool } from "@/lib/api";
import { LeaderboardEntry, FplTeam, Transaction, User, League } from "@/types";
import { AppPage } from "@/app/page";

interface Props {
  user: User;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

const rankLabel = (r: number) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : String(r);
const rankColor = (r: number) => r === 1 ? "#f59e0b" : r === 2 ? "#9ca3af" : r === 3 ? "#b45309" : "#9ca3af";
const AVATAR_BG = ["#37003c","#5a0060","#1e3a5f","#064e3b","#78350f","#7f1d1d"];

export default function LeaderboardPage({ user, onNavigate, onLogout }: Props) {
  const [allLeagues,   setAllLeagues]   = useState<League[]>([]);
  const [joinedIds,    setJoinedIds]    = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingList,  setLoadingList]  = useState(true);

  const [activeLeague, setActiveLeague] = useState<League | null>(null);
  const [entries,      setEntries]      = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const [viewingEntry, setViewingEntry] = useState<LeaderboardEntry | null>(null);
  const [viewingTeam,  setViewingTeam]  = useState<FplTeam | null>(null);
  const [teamLoading,  setTeamLoading]  = useState(false);
  const [showWallet,   setShowWallet]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetchLeagues(),
      fetchUserLeagueIds(user.id),
      fetchTransactions(user.id),
    ]).then(([leagues, ids, txs]) => {
      setAllLeagues(leagues); setJoinedIds(ids); setTransactions(txs); setLoadingList(false);
    });
  }, [user.id]);

  const joinedLeagues = allLeagues.filter((l) => joinedIds.includes(l.id));

  const openGroup = async (league: League) => {
    setActiveLeague(league);
    setEntries([]); setLoadingBoard(true);
    // TODO (Joshua): fetchLeaderboard queries Firestore leaderboard collection by leagueId
    const lb = await fetchLeaderboard(league.id);
    setEntries(lb); setLoadingBoard(false);
  };

  const goBack = () => {
    setActiveLeague(null); setEntries([]);
    setViewingEntry(null); setViewingTeam(null);
  };

  const openLineup = async (entry: LeaderboardEntry) => {
    setViewingEntry(entry); setViewingTeam(null); setTeamLoading(true);
    // TODO (Joshua): fetchFplTeam calls your /api/fpl/team route
    const team = await fetchFplTeam(entry.fplTeamId);
    setViewingTeam(team); setTeamLoading(false);
  };

  // ══════════════════════════════════════════════════════════
  // VIEW A — Joined groups list
  // ══════════════════════════════════════════════════════════
  if (!activeLeague) {
    return (
      <>
        <NavBar activePage="leaderboard" balance={user.walletBalance} user={user}
          onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} onLogout={onLogout} />

        <div className="relative overflow-hidden py-8 sm:py-10 px-4 text-center"
          style={{ background: "linear-gradient(160deg, #37003c 0%, #4a0054 60%, #1a0020 100%)" }}>
          <div className="absolute -bottom-px left-0 right-0 h-8 bg-[#f2f4f2]"
            style={{ clipPath: "ellipse(58% 100% at 50% 100%)" }} />
          <div className="relative z-10">
            <p className="text-[11px] tracking-[3px] uppercase text-white/40 mb-2">Leaderboards</p>
            <h1 className="font-display text-[30px] sm:text-[38px] font-bold text-white leading-tight">
              Your <span className="text-[#00ff87]">Pots</span>
            </h1>
            <p className="text-white/40 text-[13px] mt-1.5">Tap a pot to see its standings</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 pb-24 sm:pb-8">
          {loadingList ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}
            </div>
          ) : joinedLeagues.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-5xl mb-4">⚽</div>
              <p className="font-display text-xl font-bold text-[#37003c] mb-2">No pots joined yet</p>
              <p className="text-gray-400 text-sm mb-6">Join a pot on the Groups page to start competing.</p>
              <button onClick={() => onNavigate("groups")} className="btn-primary px-6 py-3 text-[14px]">
                Browse Pots
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {joinedLeagues.map((league) => {
                const pool  = prizePool(league);
                const pct   = Math.round((league.currentPlayers / league.maxPlayers) * 100);
                const shown = Math.min(league.currentPlayers, 5);
                return (
                  <button key={league.id} onClick={() => openGroup(league)}
                    className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.99]">
                    <div className="flex items-stretch">
                      <div className="w-1.5 flex-shrink-0 rounded-l-2xl"
                        style={{ background: "linear-gradient(180deg,#37003c,#5a0060)" }} />
                      <div className="flex-1 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="font-bold text-[15px] text-gray-900 leading-tight truncate">{league.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">GW{league.gameweek} · {league.currentPlayers} managers</p>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                            {league.status === "active" && (
                              <span className="text-[9px] font-bold text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-2 py-0.5">LIVE</span>
                            )}
                            <span className="font-display font-bold text-[17px] text-green-600 leading-none">GHS {pool}</span>
                            <span className="text-[9px] text-gray-400">prize pool</span>
                          </div>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-2.5">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#37003c,#5a0060)" }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {Array.from({ length: shown }).map((_, i) => (
                              <div key={i}
                                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                                style={{ background: AVATAR_BG[i % AVATAR_BG.length], marginLeft: i === 0 ? 0 : -7 }}>
                                {String.fromCharCode(65 + i)}
                              </div>
                            ))}
                            {league.currentPlayers > 5 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-gray-400 text-[8px] font-bold flex items-center justify-center -ml-1.5">
                                +{league.currentPlayers - 5}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            Entry: <strong className="text-[#37003c]">GHS {league.entryFee}</strong>
                            <span className="text-gray-300 text-[14px]">›</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              <button onClick={() => onNavigate("groups")}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-[13px] hover:border-[#37003c]/30 hover:text-[#37003c] transition-colors">
                + Join more pots
              </button>
            </div>
          )}
        </div>

        {showWallet && (
          <WalletModal balance={user.walletBalance} transactions={transactions}
            onClose={() => setShowWallet(false)} onDeposit={() => {}} onWithdraw={() => {}} />
        )}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW B — Standings for selected group
  // ══════════════════════════════════════════════════════════
  const prize = prizePool(activeLeague);

  return (
    <>
      <NavBar activePage="leaderboard" balance={user.walletBalance} user={user}
        onNavigate={onNavigate} onWalletClick={() => setShowWallet(true)} onLogout={onLogout} />

      <div className="relative text-center overflow-hidden py-8 sm:py-9 px-4"
        style={{ background: "linear-gradient(160deg, #37003c 0%, #4a0054 60%, #1a0020 100%)" }}>
        <div className="absolute -bottom-px left-0 right-0 h-8 bg-[#f2f4f2]"
          style={{ clipPath: "ellipse(62% 100% at 50% 100%)" }} />
        <div className="relative z-10">
          <div className="text-[36px] sm:text-4xl mb-1">🏆</div>
          <p className="text-[10px] sm:text-[11px] tracking-[3px] uppercase text-white/40 mb-1">Winner Takes</p>
          <p className="font-display text-[48px] sm:text-[56px] font-bold text-[#00ff87] leading-none">GHS {prize.toLocaleString()}</p>
          <p className="text-white/40 text-[11px] sm:text-xs mt-2">
            {activeLeague.currentPlayers} managers · GHS {activeLeague.entryFee} entry · 5% fee
          </p>
          <div className="flex gap-2 justify-center mt-3 flex-wrap">
            <span className="text-[11px] text-white/50 bg-white/8 border border-white/10 rounded-full px-3 py-1">⚽ GW{activeLeague.gameweek}</span>
            {activeLeague.status === "active" && (
              <span className="text-[11px] text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-full px-3 py-1">🔴 Live</span>
            )}
            <span className="text-[11px] text-white/50 bg-white/8 border border-white/10 rounded-full px-3 py-1">{activeLeague.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 pb-24 sm:pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-[#37003c] hover:text-[#37003c] transition-all flex-shrink-0 font-bold text-[16px]">
            ←
          </button>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#37003c] leading-tight truncate">{activeLeague.name}</h2>
            <p className="text-[11px] text-gray-400">Tap a manager to view their lineup</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/* Desktop thead */}
          <div className="hidden sm:grid bg-gray-50 border-b-2 border-gray-100 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            style={{ gridTemplateColumns: "40px 1fr 76px 76px 90px" }}>
            <span className="text-center">#</span>
            <span>Manager</span>
            <span className="text-center">Total</span>
            <span className="text-center">GW{activeLeague.gameweek}</span>
            <span className="text-center">Lineup</span>
          </div>
          {/* Mobile thead */}
          <div className="sm:hidden grid bg-gray-50 border-b-2 border-gray-100 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400"
            style={{ gridTemplateColumns: "32px 1fr 52px 60px" }}>
            <span className="text-center">#</span>
            <span>Manager</span>
            <span className="text-center">Pts</span>
            <span className="text-center">Lineup</span>
          </div>

          {loadingBoard
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center px-4 py-3.5 border-b border-gray-50">
                  <div className="w-6 h-6 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="w-10 h-8 rounded bg-gray-100 animate-pulse" />
                  <div className="w-14 h-8 rounded bg-gray-100 animate-pulse" />
                </div>
              ))
            : entries.map((entry) => {
                const isMe = entry.userId === user.id;
                return (
                  <div key={entry.userId}>
                    {/* Desktop row */}
                    <div className={`hidden sm:grid items-center px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50 ${isMe ? "bg-[#00ff87]/5 border-l-[3px] border-l-[#00ff87]" : ""}`}
                      style={{ gridTemplateColumns: "40px 1fr 76px 76px 90px" }}>
                      <div className="font-display text-xl font-bold text-center" style={{ color: rankColor(entry.rank) }}>{rankLabel(entry.rank)}</div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#37003c] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {entry.username.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] text-gray-900 leading-tight">
                            {entry.username}
                            {isMe && <span className="ml-1.5 text-[9px] bg-[#37003c]/8 text-[#37003c] font-bold rounded-full px-2 py-0.5">YOU</span>}
                          </p>
                          <p className="text-[11px] text-gray-400">FPL #{entry.fplTeamId}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-[22px] font-bold text-[#37003c]">{entry.totalPoints}</div>
                        <div className="text-[9px] text-gray-400">pts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-[14px] text-gray-700">{entry.gwPoints}</div>
                        <div className="text-[9px] text-gray-400">pts</div>
                      </div>
                      <div className="text-center">
                        {isMe ? (
                          <button onClick={() => onNavigate("lineup")}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                            My XI
                          </button>
                        ) : (
                          <button onClick={() => openLineup(entry)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg border-2 border-gray-200 text-[#37003c] hover:bg-[#37003c] hover:text-white hover:border-[#37003c] transition-all">
                            View XI
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile row */}
                    <div className={`sm:hidden grid items-center px-3 py-2.5 border-b border-gray-50 last:border-b-0 ${isMe ? "bg-[#00ff87]/5 border-l-[3px] border-l-[#00ff87]" : ""}`}
                      style={{ gridTemplateColumns: "32px 1fr 52px 60px" }}>
                      <div className="font-display text-[18px] font-bold text-center" style={{ color: rankColor(entry.rank) }}>{rankLabel(entry.rank)}</div>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#37003c] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {entry.username.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[12px] text-gray-900 leading-tight truncate">
                            {entry.username}
                            {isMe && <span className="ml-1 text-[8px] bg-[#37003c]/8 text-[#37003c] font-bold rounded-full px-1.5 py-0.5">YOU</span>}
                          </p>
                          <p className="text-[10px] text-gray-400">{entry.totalPoints}pts · GW {entry.gwPoints}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-[18px] font-bold text-[#37003c]">{entry.totalPoints}</div>
                      </div>
                      <div className="text-center">
                        {isMe ? (
                          <button onClick={() => onNavigate("lineup")}
                            className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-2 border-green-200 text-green-700 bg-green-50 w-full">My XI</button>
                        ) : (
                          <button onClick={() => openLineup(entry)}
                            className="text-[10px] font-bold px-2 py-1.5 rounded-lg border-2 border-gray-200 text-[#37003c] w-full hover:bg-[#37003c] hover:text-white transition-all">View</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
        <p className="text-center text-[11px] text-gray-300 mt-4">
          🏦 Winner paid out automatically when GW{activeLeague.gameweek} finalises
        </p>
      </div>

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
            <button onClick={() => setViewingEntry(null)} className="btn-primary w-full mt-4 text-[15px]">CLOSE</button>
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