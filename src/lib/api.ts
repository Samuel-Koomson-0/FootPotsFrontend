// src/lib/api.ts
// API hooks — currently returning mock data.
// TODO (Joshua): Replace mock returns with real Firebase / API calls.
// Each function is typed and structured for easy swap-out.

import { User, League, LeaderboardEntry, FplTeam, Transaction } from "@/types";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "user_001",
  email: "kwame@example.com",
  username: "Kwame Asante",
  fplTeamId: "4182739",
  walletBalance: 320,
  createdAt: "2024-01-10T00:00:00Z",
};

export const MOCK_LEAGUES: League[] = [
  { id: "lg_001", name: "Premier Ballers",  entryFee: 50,  maxPlayers: 8,  currentPlayers: 8,  commission: 0.05, status: "active",    gameweek: 29, createdAt: "2024-03-01T00:00:00Z" },
  { id: "lg_002", name: "The Gaffer Elite", entryFee: 100, maxPlayers: 8,  currentPlayers: 5,  commission: 0.05, status: "open",      gameweek: 29, createdAt: "2024-03-02T00:00:00Z" },
  { id: "lg_003", name: "Accra FPL Kings",  entryFee: 20,  maxPlayers: 12, currentPlayers: 10, commission: 0.05, status: "open",      gameweek: 29, createdAt: "2024-03-03T00:00:00Z" },
  { id: "lg_004", name: "Wa All Stars",     entryFee: 200, maxPlayers: 6,  currentPlayers: 4,  commission: 0.05, status: "open",      gameweek: 29, createdAt: "2024-03-04T00:00:00Z" },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { leagueId: "lg_001", userId: "user_001", username: "Kwame Asante",  fplTeamId: "4182739", totalPoints: 87, gwPoints: 64, rank: 1 },
  { leagueId: "lg_001", userId: "user_002", username: "Ama Boateng",   fplTeamId: "5291840", totalPoints: 82, gwPoints: 58, rank: 2 },
  { leagueId: "lg_001", userId: "user_003", username: "Kofi Mensah",   fplTeamId: "6304751", totalPoints: 79, gwPoints: 61, rank: 3 },
  { leagueId: "lg_001", userId: "user_004", username: "Efua Darko",    fplTeamId: "7415862", totalPoints: 74, gwPoints: 52, rank: 4 },
  { leagueId: "lg_001", userId: "user_005", username: "Yaw Otieno",    fplTeamId: "8526973", totalPoints: 71, gwPoints: 49, rank: 5 },
  { leagueId: "lg_001", userId: "user_006", username: "Akua Nyarko",   fplTeamId: "9637084", totalPoints: 68, gwPoints: 55, rank: 6 },
  { leagueId: "lg_001", userId: "user_007", username: "Nana Brew",     fplTeamId: "1748195", totalPoints: 63, gwPoints: 47, rank: 7 },
  { leagueId: "lg_001", userId: "user_008", username: "Serwaa Asante", fplTeamId: "2859206", totalPoints: 58, gwPoints: 41, rank: 8 },
];

export const MOCK_FPL_TEAM: FplTeam = {
  gk: [{ id: 1,  name: "Flekken",       club: "NEW", position: "GK",  price: 4.5,  gwPoints: 6,  totalPoints: 72  }],
  def: [
    { id: 2,  name: "Saliba",        club: "ARS", position: "DEF", price: 6.0,  gwPoints: 9,  totalPoints: 118 },
    { id: 3,  name: "Burn",          club: "NEW", position: "DEF", price: 4.5,  gwPoints: 6,  totalPoints: 64  },
    { id: 4,  name: "Pau Torres",    club: "WOL", position: "DEF", price: 4.5,  gwPoints: 4,  totalPoints: 52  },
  ],
  mid: [
    { id: 5,  name: "Palmer",        club: "CHE", position: "MID", price: 10.5, gwPoints: 14, totalPoints: 152 },
    { id: 6,  name: "Saka",          club: "ARS", position: "MID", price: 10.0, gwPoints: 10, totalPoints: 138 },
    { id: 7,  name: "Eze",           club: "CRY", position: "MID", price: 7.0,  gwPoints: 7,  totalPoints: 96  },
    { id: 8,  name: "Gibbs-White",   club: "NOT", position: "MID", price: 6.5,  gwPoints: 8,  totalPoints: 88  },
  ],
  fwd: [
    { id: 9,  name: "Haaland",       club: "MCI", position: "FWD", price: 13.0, gwPoints: 18, totalPoints: 198 },
    { id: 10, name: "Isak",          club: "NEW", position: "FWD", price: 8.5,  gwPoints: 11, totalPoints: 124 },
    { id: 11, name: "Muniz",         club: "BOU", position: "FWD", price: 6.0,  gwPoints: 7,  totalPoints: 78  },
  ],
  bench: [
    { id: 12, name: "Valdimarsson",  club: "GK",  position: "GK",  price: 4.0,  gwPoints: 2,  totalPoints: 28  },
    { id: 13, name: "Davis",         club: "SHU", position: "DEF", price: 4.5,  gwPoints: 3,  totalPoints: 36  },
    { id: 14, name: "Harwood-Bellis",club: "SHU", position: "DEF", price: 4.0,  gwPoints: 2,  totalPoints: 30  },
    { id: 15, name: "Anthony",       club: "BOU", position: "MID", price: 4.5,  gwPoints: 3,  totalPoints: 44  },
  ],
  captain: 2,       // Saliba
  viceCaptain: 9,   // Haaland
};

// ─── TRANSFER POOL (mock) ──────────────────────────────────────────────────────
export const TRANSFER_POOL: FplTeam["gk" | "def" | "mid" | "fwd"][number][] = [
  { id: 16, name: "Fernandes", club: "MUN", position: "MID", price: 7.5, gwPoints: 9, totalPoints: 108 },
  { id: 17, name: "Maddison", club: "TOT", position: "MID", price: 8.0, gwPoints: 10, totalPoints: 112 },
  { id: 18, name: "Alexander-Arnold", club: "LIV", position: "DEF", price: 7.0, gwPoints: 12, totalPoints: 115 },
  { id: 19, name: "Schmeichel", club: "LEI", position: "GK", price: 5.0, gwPoints: 6, totalPoints: 68 },
  { id: 20, name: "Watkins", club: "AVL", position: "FWD", price: 8.5, gwPoints: 11, totalPoints: 123 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx_001", type: "winnings",   description: "GW28 Winner — Premier Ballers", amount: 400,  createdAt: "2024-03-11T00:00:00Z" },
  { id: "tx_002", type: "entry",      description: "Joined Premier Ballers",         amount: -50,  createdAt: "2024-03-04T00:00:00Z" },
  { id: "tx_003", type: "deposit",    description: "Wallet Top-up via Paystack",     amount: 200,  createdAt: "2024-02-28T00:00:00Z" },
  { id: "tx_004", type: "entry",      description: "Joined Accra FPL Kings",         amount: -20,  createdAt: "2024-02-21T00:00:00Z" },
  { id: "tx_005", type: "winnings",   description: "GW25 Winner — Accra FPL Kings", amount: 220,  createdAt: "2024-02-14T00:00:00Z" },
];

export const MOCK_JOINED_LEAGUE_IDS = ["lg_001"];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * TODO (Joshua): Replace with Firebase Auth signInWithEmailAndPassword
 */
export async function loginUser(email: string, password: string): Promise<User> {
  await delay(600);
  return MOCK_USER;
}

/**
 * TODO (Joshua): Replace with Firebase Auth createUserWithEmailAndPassword
 * + Firestore users collection write
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  fplTeamId: string
): Promise<User> {
  await delay(800);
  return { ...MOCK_USER, email, username, fplTeamId };
}

/**
 * TODO (Joshua): Replace with Firebase Auth signOut
 */
export async function logoutUser(): Promise<void> {
  await delay(200);
}

// ─── LEAGUES ─────────────────────────────────────────────────────────────────

/**
 * TODO (Joshua): Replace with Firestore query: leagues collection, status != "completed"
 */
export async function fetchLeagues(): Promise<League[]> {
  await delay(500);
  return MOCK_LEAGUES;
}

/**
 * TODO (Joshua): Replace with Firestore write + Paystack payment initiation
 */
export async function joinLeague(leagueId: string, userId: string): Promise<{ paystackAuthUrl: string }> {
  await delay(700);
  // Real impl: create payment record, call Paystack initialize, return auth URL
  return { paystackAuthUrl: "https://paystack.com/pay/mock" };
}

/**
 * TODO (Joshua): Replace with Firestore write — leagues collection
 */
export async function createLeague(data: Omit<League, "id" | "currentPlayers" | "createdAt">): Promise<League> {
  await delay(600);
  return { ...data, id: `lg_${Date.now()}`, currentPlayers: 1, createdAt: new Date().toISOString() };
}

/**
 * TODO (Joshua): Replace with Firestore query — leagueMembers where userId == currentUser
 */
export async function fetchUserLeagueIds(userId: string): Promise<string[]> {
  await delay(300);
  return MOCK_JOINED_LEAGUE_IDS;
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────

/**
 * TODO (Joshua): Replace with Firestore query — leaderboard where leagueId == id, ordered by rank
 * This is updated by your Cloud Functions FPL sync job
 */
export async function fetchLeaderboard(leagueId: string): Promise<LeaderboardEntry[]> {
  await delay(500);
  return MOCK_LEADERBOARD;
}

// ─── FPL TEAM ─────────────────────────────────────────────────────────────────

/**
 * TODO (Joshua): Replace with call to your /api/fpl/team?teamId=xxx route
 * which proxies the unofficial FPL API
 */
export async function fetchFplTeam(fplTeamId: string): Promise<FplTeam> {
  await delay(600);
  return MOCK_FPL_TEAM;
}

// ─── WALLET ──────────────────────────────────────────────────────────────────

/**
 * TODO (Joshua): Replace with Firestore query — payments collection for userId
 */
export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  await delay(400);
  return MOCK_TRANSACTIONS;
}

/**
 * TODO (Joshua): Replace with Paystack deposit initiation
 */
export async function initiateDeposit(userId: string, amount: number): Promise<{ paystackAuthUrl: string }> {
  await delay(500);
  return { paystackAuthUrl: "https://paystack.com/pay/mock-deposit" };
}

// ─── UTIL ─────────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function prizePool(league: League): number {
  return Math.floor(league.entryFee * league.currentPlayers * (1 - league.commission));
}
