"use client";
// src/app/page.tsx
// Root shell — handles auth state and routes between pages.
// Replace the useState auth with your Firebase Auth context when ready.

import { useState } from "react";
import LoginPage from "./login/LoginPage";
import GroupsPage from "./groups/GroupsPage";
import LeaderboardPage from "./leaderboard/LeaderboardPage";
import LineupPage from "./lineup/LineupPage";
import { User } from "@/types";

export type AppPage = "groups" | "leaderboard" | "lineup";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<AppPage>("groups");

  // Not authenticated — show login
  if (!user) {
    return <LoginPage onAuthSuccess={(u) => setUser(u)} />;
  }

  // Authenticated — show active page
  return (
    <>
      {page === "groups"      && <GroupsPage      user={user} onNavigate={setPage} />}
      {page === "leaderboard" && <LeaderboardPage user={user} onNavigate={setPage} />}
      {page === "lineup"      && <LineupPage      user={user} onNavigate={setPage} />}
    </>
  );
}
