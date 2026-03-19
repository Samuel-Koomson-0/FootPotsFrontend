"use client";
// src/app/page.tsx

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

  if (!user) {
    return <LoginPage onAuthSuccess={(u) => setUser(u)} />;
  }

  const sharedProps = {
    user,
    onNavigate: setPage,
    onLogout: () => { setUser(null); setPage("groups"); },
  };

  return (
    <>
      {page === "groups"      && <GroupsPage      {...sharedProps} />}
      {page === "leaderboard" && <LeaderboardPage {...sharedProps} />}
      {page === "lineup"      && <LineupPage      {...sharedProps} />}
    </>
  );
}