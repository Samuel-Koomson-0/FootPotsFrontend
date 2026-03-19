// src/types/index.ts
// Shared TypeScript types — matches Firestore schema defined in README
// Both frontend and backend should import from here

export interface User {
  id: string;
  email: string;
  username: string;
  fplTeamId: string;
  walletBalance: number;
  createdAt: string;
}

export interface League {
  id: string;
  name: string;
  entryFee: number;       // in GHS
  maxPlayers: number;
  currentPlayers: number;
  commission: number;     // platform cut as decimal e.g. 0.05
  status: "open" | "active" | "completed";
  gameweek: number;
  createdAt: string;
}

export interface LeagueMember {
  leagueId: string;
  userId: string;
  fplTeamId: string;
  username: string;
}

export interface Payment {
  id: string;
  userId: string;
  leagueId: string;
  amount: number;
  status: "pending" | "success" | "failed";
  paystackReference: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  leagueId: string;
  userId: string;
  username: string;
  fplTeamId: string;
  totalPoints: number;
  gwPoints: number;
  rank: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "entry" | "winnings";
  description: string;
  amount: number;         // positive = credit, negative = debit
  createdAt: string;
}

// FPL API types
export interface FplPlayer {
  id: number;
  name: string;
  club: string;          // short club code e.g. "ARS"
  position: "GK" | "DEF" | "MID" | "FWD";
  price: number;         // in millions e.g. 13.0
  gwPoints: number;
  totalPoints: number;
}

export interface FplTeam {
  gk: FplPlayer[];
  def: FplPlayer[];
  mid: FplPlayer[];
  fwd: FplPlayer[];
  bench: FplPlayer[];
  captain: number;       // FPL player id
  viceCaptain: number;
}
