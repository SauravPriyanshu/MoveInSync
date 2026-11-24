# Case Study Write-Up: RideOps Support

## 1. Diagnosis — What Is Driving the Backlog?

Open tickets grew **+60.0%** from **30** at the end of July (21 with/via Engineering) to **48** on 30 September 2026 (34 escalated), while monthly ticket volume rose **+51.8%** (`390` in Jul &rarr; `462` in Aug &rarr; `592` in Sep). Hiring more L1 agents will not fix this without fixing escalation quality and premature closures:

1. **A third of tickets consume over two-thirds of ticket-hours:**
   - Only **33.7%** (`486 / 1,444`) of tickets are escalated to Engineering, yet escalated tickets account for **70.5%** of all resolved ticket-hours (`45,104h` of `63,944h`).
   - Median time-to-resolve jumps **6.9x** when escalated: **12.6h** (non-escalated) vs **86.8h** (escalated).
2. **Over half of escalations shouldn't go to Engineering at all:**
   - **56.6%** (`275 / 486`) of escalations did **not** end in `"Fixed"`.
   - **52.1%** (`253 / 486`) were directly **preventable at L1** (`Insufficient info - returned to L1`: `89`, `Config issue - returned to L1`: `84`, `Duplicate of known issue`: `56`, `Not a bug - how-to`: `24`), burning **62.0%** of all escalated ticket-hours.
   - Tickets bounced back for `Insufficient info` or `Config issue` average **2.33–2.39 handoffs**, take **121.1h–128.6h** median TTR, and score the worst CSAT (**2.43–2.66** vs **3.41** for Fixed).
3. **Two clear coaching outliers explain both Meera's and Sandeep's frustrations:**
   - **Over-escalating (`Rahul T`):** Escalates **61.6%** of tickets vs **31.1%** expected for his category mix (**1.98x** peer rate).
   - **Closing too fast (`Karan B`):** Median first-close of **7.9h** (fastest on the team, creating the illusion that tickets can simply be closed faster), but a **29.5% reopen rate** vs **7.1%** for peers (**4.16x**) and the lowest CSAT (**3.13**). Across the dataset, reopened tickets drop CSAT from **3.84** to **2.35**.

---

## 2. Defining Success — North Star & Weekly Cadence

**North Star:** Bring open backlog down by **&ge;35% within 4 weeks** (from 48 to &le;30 despite higher September volume) **without** increasing reopen rate.

| Weekly Metric | Baseline (Jul–Sep) | 4-Week Target | Guardrail |
|---|---:|---:|---|
| **Open tickets (end of week)** | 48 | &le;30 | — |
| **Preventable escalation share** *(Insufficient info + Config + Duplicate + How-to)* | 52.1% of escalations | &le;25% | Fixed-escalation TTR &le;72h |
| **Overall escalation rate** | 33.7% | &le;24% | No spike in reopens |
| **Reopen rate** | 10.5% | &le;8.0% | CSAT &ge;3.80 |
| **2+ handoff open tickets** | 22 open tickets | &le;5 | 100% reviewed in daily standup |

---

## 3. What We Built (v0) & Why

**Target User:** **Meera (Support Lead)** — with a built-in **Pre-Escalation Gate** her L1 agents use before opening an `ENG-xxxx` ticket. Meera has zero budget for new hires (`Ritika`), needs to stop sending preventable tickets (`Sandeep`), and needs visibility into stuck escalations and agent habits (`Meera`).

**Why `RideOps Escalation Control Tower` (`index.html`):**
- Zero-setup, single-file browser app running live on `rideops_support_tickets.csv` via `fetch` + PapaParse (with manual CSV upload fallback and Light/Dark mode).
- **Control Tower Overview & Outcome Audit:** Proves with numbers where escalated hours are leaking (`70.5%` of hours from `33.7%` of tickets; `62.0%` of escalated hours in L1-preventable outcomes).
- **Category-Mix-Adjusted Agent Table:** Flags **Rahul T** (`Over-escalating`, `1.98x` expected) and **Karan B** (`Closing too fast / reopens`, `4.16x` peers) fairly by controlling for ticket category mix.
- **Pre-Escalation Gate:** Forces an evidence check before escalation—aggregating historical outcomes for the exact issue (`>50%` non-Fixed triggers `"Hold: work the checklist at L1 first"`) and providing a category-specific diagnostic checklist.
- **Live Open Queue:** Ranks the top 25 open tickets by Priority &rarr; Handoffs &rarr; Age and prescribes the exact **Next Action** (`Escalate to lead (2+ handoffs)`, `Apply config fix`, `Get missing info`, `Chase engineering ETA`).

---

## 4. Next Four Weeks Plan & Explicit Non-Goals

### 4-Week Execution Plan
- **Week 1 — Stop the Bleeding (Process + Coaching):**
  - Mandate the Pre-Escalation Gate checklist for the top 3 leaky categories (`Roster / booking not syncing`, `Live tracking / GPS incorrect`, `Report export failing` = 78.0% of all escalations).
  - Run targeted 1:1 coaching with **Rahul T** (escalation threshold review) and **Karan B** (mandatory confirmation before closure to cut the 29.5% reopen rate).
  - Clear the **22 open tickets with 2+ handoffs** in daily 15-min Support + Eng triage.
- **Week 2 — L1 Config Enablement & Known-Issue Lookup:**
  - Document the top 5 `"Config issue - returned to L1"` fixes (booking cutoff sync, Excel upload limits, rate cards, SSO metadata) as L1 runbooks so L1 resolves them without engineering.
  - Add a shared Known Issues list to catch `"Duplicate of known issue"` (`56` escalations / `11.5%`) at intake.
- **Week 3 — Ticket Tooling Integration:**
  - Enforce required diagnostic fields inside the actual ticketing form (Trip ID, timestamps, app version, screenshot) mirroring Section 4's checklists so incomplete tickets cannot be escalated.
  - Add automated SLA alerts to Slack/email for any ticket open `>48h` with Engineering or `handoffs >= 2`.
- **Week 4 — Retrospective & Calibration:**
  - Re-pull ticket CSV, measure reduction in non-Fixed escalations, handoffs, and open backlog; tune the 50% gate threshold per category with Engineering (`Sandeep`) and Ops (`Ritika`).

### What We Deliberately Did Not Do in v0
- **No backend database or ticketing-system API writeback:** v0 reads the CSV export in-browser so it ships immediately with zero IT/security blockers.
- **No ML / LLM auto-triage:** Deterministic historical ratios and category checklists are transparent, auditable, and explainable to Engineering and Ops in 2 minutes.
- **No headcount request or new SLA tiers:** Solves capacity via deflection of the `52.1%` preventable escalations rather than hiring (`Ritika`'s hard constraint).
