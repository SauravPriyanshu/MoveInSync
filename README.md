# RideOps Escalation Control Tower

A zero-build, single-file internal operations dashboard (`index.html`) built for RideOps' Support Lead to diagnose escalation waste, enforce a pre-escalation gate at L1, spot agent coaching outliers, and triage the live open backlog.

## Files

- `index.html` — Single-file web app (vanilla HTML/CSS/JS + PapaParse via cdnjs). Computes all metrics live in the browser and supports light/dark mode.
- `rideops_support_tickets.csv` — Ticket dataset (1,444 tickets from 2 Jul – 30 Sep 2026).
- `rideops_data_dictionary.csv` — Column definitions.
- `Case_Study_Writeup.md` — Concise 4-part case study write-up (diagnosis, success metrics, v0 rationale, and 4-week plan).

## How to Run

### Option 1: Direct open (zero setup)
Double-click `index.html` in File Explorer. It loads the built-in dataset automatically so the dashboard renders right away, and you can still use **Upload CSV** in the top-right to load a newer CSV.

### Option 2: Local HTTP server (live `fetch` from `rideops_support_tickets.csv`)
1. Open a terminal in this folder (`e:\work\MoveInSync` or the repo root) and start a local static HTTP server:
   ```bash
   python -m http.server
   ```
2. Open [http://localhost:8000](http://localhost:8000) in your browser.
3. `index.html` automatically fetches `rideops_support_tickets.csv` from the same folder (or use **Upload CSV** anytime to swap datasets).

## What It Computes

1. **KPI Cards**: Open tickets (`48`: `19` with Engineering, `29` with L1), escalation rate (`33.7%`), share of resolved ticket-hours from escalated tickets (`70.5%`) vs ticket share (`33.7%`), median time-to-resolve (`12.6h` non-escalated vs `86.8h` escalated), `%` of escalations not `"Fixed"` (`56.6%`), and reopen rate (`10.5%`) with CSAT impact (`2.35` reopened vs `3.84` not reopened).
2. **Escalations by Engineering Outcome**: Count, average handoffs, median TTR, average CSAT, share of escalated ticket-hours, and L1-preventable classification (`Insufficient info`, `Config issue`, `Duplicate of known issue`, `Not a bug - how-to`).
3. **Agent Quality & Escalation Audit**: Category-mix-adjusted expected escalation rate, median first-close time, reopen rate, CSAT, and automatic coaching flags (`Over-escalating` at `>1.4x` expected; `Closing too fast / reopens` at `>2.0x` peers).
4. **Pre-Escalation Gate**: Category + issue selector showing historical escalation rate, outcome breakdown, an automatic **Hold** vs **Escalate** verdict (`>50%` non-Fixed triggers Hold), and an interactive per-category diagnostic checklist.
5. **Live Open Queue**: Top 25 open tickets (with toggle to view all 48) sorted by priority (`P1`–`P4`), engineering handoffs descending, and age, paired with deterministic **Next Action** tags.
