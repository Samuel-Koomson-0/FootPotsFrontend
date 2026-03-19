// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "FootPots — FPL Prize Leagues",
  description: "Compete in paid Fantasy Premier League mini-leagues and win real money.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
