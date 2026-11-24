# RideOps Escalation Control Tower (React + Vite)

An internal operations dashboard built with **React + Vite** and **PapaParse** for RideOps' Support Lead to diagnose escalation waste, enforce a pre-escalation gate at L1, spot agent coaching outliers, and triage the live open backlog.

## Project Structure

- `src/App.jsx` — Root React app managing theme, CSV loading (`fetch` + PapaParse with built-in fallback & manual upload), and derived state.
- `src/utils/metrics.js` — Pure data processing, KPI, outcome, agent audit, pre-escalation checklist, and live queue sorting/action helpers.
- `src/components/` — Modular UI sections (`Header`, `KpiGrid`, `OutcomeTable`, `AgentTable`, `PreEscalationGate`, `LiveQueue`).
- `public/rideops_support_tickets.csv` — Default CSV fetched at runtime.
- `rideops_support_tickets.csv` & `rideops_data_dictionary.csv` — Original case study datasets.
- `Case_Study_Writeup.md` — Concise 4-part case study write-up (diagnosis, success metrics, v0 rationale, and 4-week plan).

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open the local URL printed by Vite (typically `http://localhost:5173`).
3. Build for production:
   ```bash
   npm run build
   ```
   Outputs static assets to `dist/` (which can be previewed with `npm run preview` or deployed to GitHub Pages / Netlify / Vercel).

## What It Computes

1. **KPI Cards**: Open tickets (`48`: `19` with Engineering, `29` with L1), escalation rate (`33.7%`), share of resolved ticket-hours from escalated tickets (`70.5%`) vs ticket share (`33.7%`), median time-to-resolve (`12.6h` non-escalated vs `86.8h` escalated), `%` of escalations not `"Fixed"` (`56.6%`), and reopen rate (`10.5%`) with CSAT impact (`2.35` reopened vs `3.84` not reopened).
2. **Escalations by Engineering Outcome**: Count, average handoffs, median TTR, average CSAT, share of escalated ticket-hours, and L1-preventable classification (`Insufficient info`, `Config issue`, `Duplicate of known issue`, `Not a bug - how-to`).
3. **Agent Quality & Escalation Audit**: Category-mix-adjusted expected escalation rate, median first-close time, reopen rate, CSAT, and automatic coaching flags (`Over-escalating` at `>1.4x` expected; `Closing too fast / reopens` at `>2.0x` peers).
4. **Pre-Escalation Gate**: Category + issue selector showing historical escalation rate, outcome breakdown, an automatic **Hold** vs **Escalate** verdict (`>50%` non-Fixed triggers Hold), and an interactive per-category diagnostic checklist.
5. **Live Open Queue**: Top 25 open tickets (with toggle to view all `48`) sorted by priority (`P1`–`P4`), engineering handoffs descending, and age, paired with deterministic **Next Action** tags.
