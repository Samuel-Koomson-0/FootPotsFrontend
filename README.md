# FootPots — Frontend UI

**Fantasy Premier League prize leagues. Compete with friends. Win real money.**

Built with **Next.js · TypeScript · TailwindCSS**. Backend by Joshua (Firebase + Paystack + FPL API).

---

## Project Status

**Phase 1 — UI Complete, Backend Integration Pending**

The full UI has been built and is ready for backend wiring. All pages are functional with placeholder/mock data. Every spot that needs a real API call is marked with a `// TODO (Joshua):` comment.

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  Root layout — loads fonts and globals.css
│   ├── page.tsx                    Auth gate + page router
│   ├── login/
│   │   └── LoginPage.tsx           Login & Sign Up
│   ├── groups/
│   │   └── GroupsPage.tsx          Browse, join and create pots
│   ├── leaderboard/
│   │   └── LeaderboardPage.tsx     Joined pots list + per-pot standings
│   └── lineup/
│       └── LineupPage.tsx          Team selection — pitch, transfers, captain
├── components/
│   ├── ui.tsx                      NavBar, WalletModal, JerseyIcon, MiniPitch, DeadlineBanner
│   ├── ProfileModal.tsx            Profile + Settings slide-up modal
│   └── NotificationsPanel.tsx      Notifications feed slide-up panel
├── lib/
│   └── api.ts                      All API hooks (mock data + TODO stubs for Joshua)
├── types/
│   └── index.ts                    Shared TypeScript types matching Firestore schema
└── styles/
    └── globals.css                 Tailwind + custom pitch/button utilities
```

---

## Pages

### Login / Sign Up — `LoginPage.tsx`

Two-panel layout. Left side has branding and feature highlights. Right side is the auth card.

- Toggle between Login and Sign Up tabs
- Sign Up collects: Full Name, Email, Password, FPL Team ID
- Login collects: Email, Password
- Enter key submits the form
- Error messages display inline if fields are missing
- On success calls `onAuthSuccess(user)` which is wired in `page.tsx`

**Backend hook:** `loginUser()` and `signupUser()` in `api.ts`

---

### Groups Page — `GroupsPage.tsx`

Main landing page after login. Browse and manage pots.

**Hero section**
- Shows total GHS in active pools, current gameweek, user wallet balance

**Pot cards grid**
- 1 column mobile / 2 tablet / 3 desktop
- Each card shows: pot name, gameweek, fill progress bar, entry fee, prize pool, member avatars
- LIVE badge appears on active pots
- Joined pots show green "✓ Joined" state

**Join flow**
- Tap "Join & Pay GHS X" → confirmation modal showing entry fee and updated prize pool
- Confirm deducts from wallet (UI only — Paystack wiring pending)

**Create Pot modal**
- Fields: Pot Name, Entry Fee (GHS), Max Players (4/6/8/10/12), Gameweek
- Warning note showing how much wallet will be charged
- Created pot immediately appears in the grid

**Backend hooks:** `fetchLeagues()`, `fetchUserLeagueIds()`, `joinLeague()`, `createLeague()`

---

### Leaderboard Page — `LeaderboardPage.tsx`

Two-view page — pot picker first, then standings.

**View A — Your Pots**
- Lists every pot the user has joined as tappable cards
- Each card shows: pot name, gameweek, prize pool, fill bar, member avatars, entry fee
- Empty state with "Browse Pots" CTA if no pots joined
- "+ Join more pots" shortcut at the bottom

**View B — Standings (after tapping a pot)**
- Prize pool hero banner with live countdown chips
- Back button returns to pot list
- Full standings table: rank medals, manager name, total pts, GW pts, lineup button
- Responsive: full 5-column table on desktop, condensed 4-column on mobile
- "View XI" opens a slide-up modal with a mini pitch showing that manager's lineup
- "My XI" navigates to the Lineup page
- Your row is highlighted green with a YOU badge

**Backend hooks:** `fetchLeagues()`, `fetchUserLeagueIds()`, `fetchLeaderboard()`, `fetchFplTeam()`

---

### Lineup Page — `LineupPage.tsx`

Full team selection page.

**Toolbar**
- Points / Price toggle — switches all player tiles between GW points and price display
- Formation picker — 7 formations (4-3-3, 4-4-2, 4-5-1, 3-4-3, 3-5-2, 5-3-2, 5-4-1) with visual dot diagrams
- Swap mode — tap two players (pitch or bench) to swap positions; GKs can only swap with GKs
- Captain picker — modal with C and V buttons for every starter; badges update live on pitch
- Transfer — select player out, pick replacement filtered by position, confirm

**Pitch**
- SVG jersey icons for all Premier League clubs with correct colours and stripe patterns
- Formation-aware rows that update when formation changes
- Captain (amber C) and Vice (grey V) badge overlays on jerseys
- Selected player glows green and scales up during swap mode

**Bench**
- 4 bench players shown below pitch, participate in swaps

**Save Lineup** — confirmation flash, `// TODO (Joshua):` persist to Firestore

**Backend hooks:** `fetchFplTeam()`, `fetchTransactions()`

---

## Shared Components — `ui.tsx`

### NavBar

Sticky top bar on all authenticated pages.

- Logo, desktop nav links, wallet balance button
- **Bell icon** — unread badge, opens NotificationsPanel
- **Avatar button** — user initials, opens ProfileModal
- **Hamburger** — mobile only slide-down menu
- **Bottom tab bar** — mobile only, fixed to bottom
- **DeadlineBanner** — sits directly below the nav on every page

### DeadlineBanner

Persistent coloured banner showing the GW deadline countdown.

- Live seconds-accurate countdown
- Colour: blue (normal) → amber (< 24 hours) → red (< 3 hours)
- Dismissable with × button
- `// TODO (Joshua):` replace `GW30_DEADLINE` with real value from FPL API

### WalletModal

Slide-up panel with balance card, Deposit / Withdraw buttons, and transaction history.

### JerseyIcon

SVG jersey with club colours, stripe patterns, and C/V badge overlays.

Clubs supported: ARS, CHE, MCI, NEW, LIV, CRY, NOT, WOL, SHU, BOU, GK

### MiniPitch

Compact pitch for the leaderboard "View XI" modal. Shows another manager's full lineup.

---

## Profile Modal — `ProfileModal.tsx`

Slide-up triggered by the avatar button.

**Profile tab**
- Stats: Pots Played, Total Won, Win Rate, Best Rank
- Editable fields: Display Name, FPL Team ID
- Email (read-only)
- Recent activity feed

**Settings tab**
- Notification toggles: Email, Push, Dark Mode (coming soon)
- Account links: Change Password, Payment Methods, Privacy Policy, Terms, Help
- Danger Zone: Delete Account

**Log Out** — clears session and returns to login

**Backend hook:** `// TODO (Joshua):` update Firestore users collection on save

---

## Notifications Panel — `NotificationsPanel.tsx`

Slide-up triggered by the bell icon.

- Grouped into New and Earlier sections
- Tap to mark individual notifications as read
- Mark all read button
- Unread count badge updates live on bell icon
- 6 types: win, join, rank, deadline, transfer, payout
- Empty state when all caught up

**Backend hook:** Replace `MOCK_NOTIFICATIONS` with Firestore notifications collection

---

## API Layer — `lib/api.ts`

All data functions live here. Currently returns mock data.

| Function | Returns | Backend target |
|---|---|---|
| `loginUser()` | User | Firebase Auth `signInWithEmailAndPassword` |
| `signupUser()` | User | Firebase Auth `createUserWithEmailAndPassword` + Firestore write |
| `fetchLeagues()` | League[] | Firestore `leagues` collection |
| `fetchUserLeagueIds()` | string[] | Firestore `leagueMembers` where `userId` |
| `joinLeague()` | Paystack URL | Create payment record + Paystack initialize |
| `createLeague()` | League | Firestore `leagues` write |
| `fetchLeaderboard()` | LeaderboardEntry[] | Firestore `leaderboard` where `leagueId` |
| `fetchFplTeam()` | FplTeam | `/api/fpl/team` proxy route |
| `fetchTransactions()` | Transaction[] | Firestore `payments` where `userId` |
| `initiateDeposit()` | Paystack URL | Paystack deposit initialize |
| `prizePool()` | number | Pure function — `entryFee × players × (1 − commission)` |

---

## Types — `types/index.ts`

TypeScript interfaces matching the Firestore schema. Both frontend and backend import from here.

`User · League · LeagueMember · Payment · LeaderboardEntry · Transaction · FplPlayer · FplTeam`

---

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| Purple | `#37003c` | Primary — nav, buttons, headings |
| Purple Mid | `#5a0060` | Gradients, hover states |
| Green | `#00ff87` | Accents, CTAs, active states |
| Green Dark | `#00c96b` | Text accents, success states |
| Off White | `#f2f4f2` | Page background |

Fonts: **Rajdhani** (display/headings) · **DM Sans** (body)

---

## Setup

```bash
npm install
npm run dev
# → http://localhost:3000
```

Ensure `@/` is aliased to `src/` in `tsconfig.json` (Next.js default). Import `globals.css` in `layout.tsx`.

---

## Responsiveness

All pages are fully responsive:

- Mobile: single column layouts, bottom tab bar navigation, condensed table rows, hamburger menu
- Tablet: 2-column pot grid, full nav links
- Desktop: 3-column pot grid, full 5-column leaderboard table, two-panel login

---

## What's Left (Phase 1)

| Feature | Owner | Status |
|---|---|---|
| Firebase Auth wiring | Joshua | Pending |
| Firestore data wiring | Joshua | Pending |
| FPL API proxy route | Joshua | Pending |
| Paystack payment flow | Joshua | Pending |
| GW deadline from FPL API | Joshua | Pending |
| Onboarding flow (3-step) | Frontend | Not started |
| Wallet deposit UI | Frontend | Not started |
| Pot invite / share link | Frontend | Not started |
| Empty states & error handling | Frontend | Not started |
| Results / History page | Frontend | Not started |

---

## Contributors

- **Joshua** — Backend, infrastructure, Firebase, Paystack, FPL API
- **Samuel** — Frontend, UI, product design