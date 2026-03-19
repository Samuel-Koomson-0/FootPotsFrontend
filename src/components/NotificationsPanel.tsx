"use client";
// src/components/NotificationsPanel.tsx

import { useState } from "react";

export interface Notification {
  id: string;
  type: "win" | "join" | "rank" | "deadline" | "transfer" | "payout";
  title: string;
  body: string;
  time: string;
  read: boolean;
  leagueName?: string;
}

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

const TYPE_META: Record<Notification["type"], { icon: string; bg: string }> = {
  win:      { icon: "🏆", bg: "#fef9c3" },
  join:     { icon: "👥", bg: "#ede9fe" },
  rank:     { icon: "📊", bg: "#f0fdf4" },
  deadline: { icon: "⏰", bg: "#fff7ed" },
  transfer: { icon: "🔄", bg: "#eff6ff" },
  payout:   { icon: "💰", bg: "#f0fdf4" },
};

function NotifItem({ notif, onRead }: { notif: Notification; onRead: () => void }) {
  const meta = TYPE_META[notif.type];
  return (
    <div
      onClick={onRead}
      className="flex items-start gap-3 px-3.5 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150"
      style={{
        borderColor: notif.read ? "transparent" : "rgba(55,0,60,0.1)",
        background:  notif.read ? "#f9fafb" : "white",
        boxShadow:   notif.read ? "none" : "0 1px 8px rgba(55,0,60,0.06)",
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
        style={{ background: meta.bg }}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] leading-tight ${notif.read ? "font-medium text-gray-500" : "font-bold text-gray-900"}`}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-2 h-2 rounded-full bg-[#37003c] flex-shrink-0 mt-1" />}
        </div>
        <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{notif.body}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] text-gray-300">{notif.time}</p>
          {notif.leagueName && (
            <>
              <span className="text-gray-200">·</span>
              <p className="text-[10px] font-semibold text-[#37003c]/50 truncate">{notif.leagueName}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel({ notifications, onClose, onMarkAllRead }: Props) {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markRead  = (id: string) => setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAll   = () => { setItems((p) => p.map((n) => ({ ...n, read: true }))); onMarkAllRead(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: "88vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-bold text-[#37003c]">Notifications</h2>
            {unread > 0 && (
              <span className="bg-[#37003c] text-white text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="text-[12px] font-bold text-[#37003c] hover:underline">
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">🔔</div>
            <p className="font-display text-lg font-bold text-gray-400">All caught up!</p>
            <p className="text-[13px] text-gray-300 mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unread > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">New</p>
                {items.filter((n) => !n.read).map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={() => markRead(n.id)} />
                ))}
              </>
            )}
            {items.some((n) => n.read) && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3 mb-1">Earlier</p>
                {items.filter((n) => n.read).map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={() => markRead(n.id)} />
                ))}
              </>
            )}
          </div>
        )}

        <button onClick={onClose}
          className="w-full mt-5 py-3.5 rounded-xl bg-[#37003c] text-white font-display font-bold text-[15px] tracking-wide">
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ── Mock data — replace with real Firestore notifications ─────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "deadline", read: false, time: "Just now",
    title: "GW30 deadline in 2 hours",
    body: "Finalise your captain and transfers before 11:30 AM.",
    leagueName: "Premier Ballers",
  },
  {
    id: "n2", type: "join", read: false, time: "2h ago",
    title: "Kofi Mensah joined your pot",
    body: "Premier Ballers is now full — 8/8 managers. The pot kicks off this GW.",
    leagueName: "Premier Ballers",
  },
  {
    id: "n3", type: "win", read: false, time: "3 days ago",
    title: "You won GW28! 🎉",
    body: "You topped the leaderboard with 64 pts. GHS 400 added to your wallet.",
    leagueName: "Premier Ballers",
  },
  {
    id: "n4", type: "rank", read: true, time: "5 days ago",
    title: "You're #1 after 6 gameweeks",
    body: "Leading Premier Ballers with 87 total points. Keep it up.",
    leagueName: "Premier Ballers",
  },
  {
    id: "n5", type: "transfer", read: true, time: "6 days ago",
    title: "Transfer confirmed",
    body: "Muniz → Watkins successfully transferred for GW30.",
  },
  {
    id: "n6", type: "payout", read: true, time: "1 week ago",
    title: "Payout processed",
    body: "GHS 400 from GW28 winnings has landed in your Footpots wallet.",
  },
];