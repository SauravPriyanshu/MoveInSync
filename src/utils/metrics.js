export const PULL_DATE_MS = new Date("2026-09-30T23:59:00").getTime();

export const PREVENTABLE_OUTCOMES = new Set([
  "Insufficient info - returned to L1",
  "Config issue - returned to L1",
  "Duplicate of known issue",
  "Not a bug - how-to"
]);

export const PRIO_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 };

export const CATEGORY_CHECKLISTS = {
  "Roster / booking not syncing": [
    "Client ID, site/office code, and affected shift date & shift time",
    "Employee ID(s) or uploaded Excel file + exact upload timestamp (IST)",
    "Screenshot of admin booking/cutoff config page vs employee app view",
    "Confirm whether shift booking cutoff was edited within the last 24h (L1 config check)",
    "Check Known Issues board for active roster sync delay before escalating"
  ],
  "Live tracking / GPS incorrect": [
    "Trip ID, Vehicle number, Driver ID, and Employee ID",
    "Timestamps (IST) when GPS froze, jumped, or showed wrong ETA",
    "Driver app & Employee app version + device OS (Android/iOS)",
    "Screenshot of live map pin vs actual vehicle/gate location or tracking URL",
    "Confirm driver has location permissions & background GPS enabled (L1 check)"
  ],
  "Report export failing": [
    "Exact report name, selected date range, and client/site filter applied",
    "Timestamp (IST) of export attempt + job/schedule ID if scheduled email",
    "Screenshot of browser console/network error or blank/stuck export screen",
    "Verify date range <= 15 days or test split export as L1 workaround",
    "Confirm manager email / spam filter & role permissions before escalating"
  ],
  "Cab delay / no-show complaint": [
    "Trip ID, Route number, Shift timing, and Vendor/Driver ID",
    "Scheduled pickup time vs actual arrival/no-show timestamp (IST)",
    "Screenshot of trip timeline / GPS audit trail showing driver check-in location",
    "Client/site transport desk confirmation on vendor SLA breach",
    "Verify if operational vendor escalation is needed instead of Engineering"
  ],
  "How-to / feature request": [
    "Client ID, Client tier, and requester admin name/email",
    "Exact workflow goal (e.g., shift timing, female-first drop rule, alert channel)",
    "Screenshot of current admin settings page where user is stuck",
    "Check L1 Knowledge Base / how-to guide and send walkthrough first",
    "Log as Product Feature Request (do NOT escalate to Engineering bug queue)"
  ],
  "Login / access issue": [
    "Affected user email / Employee ID, Client ID, and site",
    "Screenshot of exact error message + timestamp (IST) of failed login",
    "Browser/App version and auth method (Password vs SSO/SAML)",
    "Verify user role, active status, and password-reset lockout in L1 admin",
    "Confirm SSO metadata/certificate expiry status with client IT if SSO fails"
  ],
  "OTP / boarding issue": [
    "Trip ID, Employee ID, Driver ID, and shift time",
    "Timestamp (IST) of OTP generation and entry attempt",
    "Driver app version & Employee app version + network connectivity status",
    "Screenshot of invalid OTP / trip-not-starting screen on driver app",
    "Check SMS/OTP gateway delivery logs in L1 tool before escalating"
  ],
  "Billing / invoice discrepancy": [
    "Invoice ID, billing cycle dates, Client ID, and vendor/rate-card ID",
    "Affected Trip IDs (cancelled/dead-km/duplicate toll trips) with timestamps",
    "Screenshot or CSV export of mismatched invoice line items vs trip log",
    "Verify client rate-card & cancellation-fee config in L1 billing settings",
    "Confirm whether discrepancy is config/rate-card setup before escalating"
  ],
  "Employee address / geocode change": [
    "Employee ID, Client ID, site, and old vs requested new address",
    "Exact lat/long coordinates or Google Maps pin link + screenshot",
    "Timestamp (IST) when address update was submitted in portal",
    "Verify geocode approval workflow & effective roster cycle date at L1",
    "Confirm pin-drop society boundary is updated in L1 admin before escalating"
  ],
  "Driver / vehicle compliance docs": [
    "Vehicle registration number, Driver ID, Vendor name, and Client ID",
    "Document type (Insurance / Fitness / BGV), expiry date, and upload timestamp",
    "Screenshot of upload error or stale verification status in compliance tab",
    "Verify file format/size limits and manual document approval queue at L1",
    "Confirm vehicle is de-rostered in L1 if insurance is expired"
  ]
};

export const DEFAULT_CHECKLIST = [
  "Ticket ID, Client ID / Site, and affected User/Trip ID",
  "Exact timestamps (IST) when the issue occurred",
  "Screenshot or screen recording of the error state",
  "App version / Browser + OS details",
  "L1 configuration & knowledge-base checks completed"
];

function parseTs(str) {
  if (!str || !str.trim()) return null;
  const ms = Date.parse(str.trim().replace(" ", "T") + ":00");
  return Number.isNaN(ms) ? null : ms;
}

export function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function fmtHours(h) {
  if (h === null || h === undefined || Number.isNaN(h)) return "—";
  if (h < 24) return `${h.toFixed(1)}h`;
  const d = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  return `${h.toFixed(1)}h (${d}d ${rem}h)`;
}

export function fmtAge(h) {
  if (h === null || Number.isNaN(h)) return "—";
  if (h < 24) return `${h.toFixed(1)}h`;
  const d = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  return `${d}d ${rem}h`;
}

export function fmtPct(ratio) {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(1)}%`;
}

export function normalizeDescription(desc) {
  return String(desc || "")
    .replace(/\b(route|for|missing)\s+\d+\b/gi, "$1 <N>")
    .replace(/\b\d+\s+(employees|users|trips)\b/gi, "<N> $1");
}

export function processTickets(rows) {
  return rows
    .filter((r) => r && r.ticket_id)
    .map((r) => {
      const createdMs = parseTs(r.created_at);
      const firstClosedMs = parseTs(r.first_closed_at);
      const finalClosedMs = parseTs(r.final_closed_at);
      const ttrHours =
        createdMs !== null && finalClosedMs !== null
          ? (finalClosedMs - createdMs) / 3600000
          : null;
      const firstCloseHours =
        createdMs !== null && firstClosedMs !== null
          ? (firstClosedMs - createdMs) / 3600000
          : null;
      const ageHours =
        createdMs !== null ? Math.max(0, (PULL_DATE_MS - createdMs) / 3600000) : 0;
      const handoffs = parseInt(r.eng_handoffs, 10) || 0;
      const reopenCount = parseInt(r.reopen_count, 10) || 0;
      const csat =
        r.csat_score !== "" && r.csat_score != null ? parseFloat(r.csat_score) : null;
      return {
        ...r,
        isEscalated: String(r.escalated_to_eng).trim().toLowerCase() === "yes",
        isOpen: String(r.status).trim() !== "Closed",
        isReopened: reopenCount > 0,
        handoffs,
        reopenCount,
        csat: Number.isNaN(csat) ? null : csat,
        ttrHours,
        firstCloseHours,
        ageHours,
        descGroup: normalizeDescription(r.description)
      };
    });
}

export function computeKpis(tickets) {
  const total = tickets.length;
  const openTickets = tickets.filter((t) => t.isOpen);
  const openEng = openTickets.filter((t) => t.status === "Open - with Engineering").length;
  const openL1 = openTickets.filter((t) => t.status === "Open - with L1").length;
  const openEsc = openTickets.filter((t) => t.isEscalated).length;

  const escalated = tickets.filter((t) => t.isEscalated);
  const nonEscalated = tickets.filter((t) => !t.isEscalated);
  const escShareTickets = total ? escalated.length / total : 0;

  const closedTickets = tickets.filter((t) => t.ttrHours !== null);
  const closedEscHours = closedTickets
    .filter((t) => t.isEscalated)
    .reduce((s, t) => s + t.ttrHours, 0);
  const closedTotalHours = closedTickets.reduce((s, t) => s + t.ttrHours, 0);
  const escShareHours = closedTotalHours ? closedEscHours / closedTotalHours : 0;

  const medNonEsc = median(
    nonEscalated.filter((t) => t.ttrHours !== null).map((t) => t.ttrHours)
  );
  const medEsc = median(
    escalated.filter((t) => t.ttrHours !== null).map((t) => t.ttrHours)
  );
  const ttrMultiplier = medNonEsc && medEsc ? (medEsc / medNonEsc).toFixed(1) : "—";

  const nonFixedEsc = escalated.filter((t) => t.eng_outcome !== "Fixed");
  const preventableEsc = escalated.filter((t) => PREVENTABLE_OUTCOMES.has(t.eng_outcome));

  const reopened = tickets.filter((t) => t.isReopened);
  const notReopened = tickets.filter((t) => !t.isReopened);
  const csatReopened = mean(reopened.filter((t) => t.csat !== null).map((t) => t.csat));
  const csatNotReopened = mean(notReopened.filter((t) => t.csat !== null).map((t) => t.csat));

  return {
    total,
    openCount: openTickets.length,
    openEng,
    openL1,
    openEsc,
    escalatedCount: escalated.length,
    escShareTickets,
    closedEscHours,
    closedTotalHours,
    escShareHours,
    medNonEsc,
    medEsc,
    ttrMultiplier,
    nonFixedCount: nonFixedEsc.length,
    nonFixedRate: escalated.length ? nonFixedEsc.length / escalated.length : 0,
    preventableCount: preventableEsc.length,
    preventableRate: escalated.length ? preventableEsc.length / escalated.length : 0,
    reopenedCount: reopened.length,
    reopenRate: total ? reopened.length / total : 0,
    csatReopened,
    csatNotReopened
  };
}

export function computeOutcomes(tickets) {
  const escalated = tickets.filter((t) => t.isEscalated);
  const totalEscHours = escalated
    .filter((t) => t.ttrHours !== null)
    .reduce((s, t) => s + t.ttrHours, 0);

  const groups = new Map();
  for (const t of escalated) {
    const key = t.eng_outcome || "(Blank)";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }

  const rows = [...groups.entries()]
    .map(([outcome, list]) => {
      const hrs = list.filter((t) => t.ttrHours !== null).reduce((s, t) => s + t.ttrHours, 0);
      return {
        outcome,
        count: list.length,
        pctCount: escalated.length ? list.length / escalated.length : 0,
        avgHo: mean(list.map((t) => t.handoffs)),
        medTtr: median(list.filter((t) => t.ttrHours !== null).map((t) => t.ttrHours)),
        avgCsat: mean(list.filter((t) => t.csat !== null).map((t) => t.csat)),
        shareHrs: totalEscHours ? hrs / totalEscHours : 0,
        preventable: PREVENTABLE_OUTCOMES.has(outcome)
      };
    })
    .sort((a, b) => b.count - a.count);

  const prevCount = escalated.filter((t) => PREVENTABLE_OUTCOMES.has(t.eng_outcome)).length;
  const prevHrs = escalated
    .filter((t) => t.ttrHours !== null && PREVENTABLE_OUTCOMES.has(t.eng_outcome))
    .reduce((s, t) => s + t.ttrHours, 0);

  return {
    rows,
    totals: {
      count: escalated.length,
      avgHo: mean(escalated.map((t) => t.handoffs)),
      medTtr: median(escalated.filter((t) => t.ttrHours !== null).map((t) => t.ttrHours)),
      avgCsat: mean(escalated.filter((t) => t.csat !== null).map((t) => t.csat)),
      prevCount,
      prevPctCount: escalated.length ? prevCount / escalated.length : 0,
      prevPctHrs: totalEscHours ? prevHrs / totalEscHours : 0
    }
  };
}

export function computeAgents(tickets) {
  const agents = [...new Set(tickets.map((t) => t.assigned_agent).filter(Boolean))];
  return agents.map((agent) => {
    const mine = tickets.filter((t) => t.assigned_agent === agent);
    const others = tickets.filter((t) => t.assigned_agent !== agent);
    const escRate = mine.length ? mine.filter((t) => t.isEscalated).length / mine.length : 0;

    const catCounts = new Map();
    for (const t of mine) catCounts.set(t.category, (catCounts.get(t.category) || 0) + 1);
    let expectedEscCount = 0;
    for (const [cat, cnt] of catCounts.entries()) {
      const peerCat = others.filter((t) => t.category === cat);
      const peerRate = peerCat.length
        ? peerCat.filter((t) => t.isEscalated).length / peerCat.length
        : escRate;
      expectedEscCount += cnt * peerRate;
    }
    const expectedEscRate = mine.length ? expectedEscCount / mine.length : 0;
    const escRatio = expectedEscRate > 0 ? escRate / expectedEscRate : 1;

    const medianFirstClose = median(
      mine.filter((t) => t.firstCloseHours !== null).map((t) => t.firstCloseHours)
    );
    const reopenRate = mine.length ? mine.filter((t) => t.isReopened).length / mine.length : 0;
    const otherReopenRate = others.length
      ? others.filter((t) => t.isReopened).length / others.length
      : 0;
    const reopenRatio = otherReopenRate > 0 ? reopenRate / otherReopenRate : 1;
    const avgCsat = mean(mine.filter((t) => t.csat !== null).map((t) => t.csat));

    const flags = [];
    if (escRatio > 1.4) flags.push({ text: "Over-escalating", cls: "badge-danger" });
    if (reopenRatio > 2.0) flags.push({ text: "Closing too fast / reopens", cls: "badge-warning" });

    return {
      agent,
      tickets: mine.length,
      escRate,
      expectedEscRate,
      escRatio,
      medianFirstClose,
      reopenRate,
      otherReopenRate,
      reopenRatio,
      avgCsat,
      flags
    };
  });
}

export function getNextAction(t) {
  const subAction = (() => {
    if (t.eng_outcome === "Insufficient info - returned to L1") return "Get missing info";
    if (t.eng_outcome === "Config issue - returned to L1") return "Apply config fix";
    if (t.status === "Open - with Engineering") return "Chase engineering ETA";
    if (t.eng_outcome === "Fixed") return "Confirm fix & close";
    if (t.eng_outcome === "Not a bug - how-to") return "Send how-to & close";
    if (t.eng_outcome === "Duplicate of known issue") return "Link known issue & close";
    if (t.eng_outcome === "Not reproducible") return "Request repro steps";
    return "Work L1 checklist";
  })();

  if (t.handoffs >= 2) {
    return { primary: "Escalate to lead (2+ handoffs)", detail: subAction, cls: "badge-danger" };
  }
  if (t.eng_outcome === "Insufficient info - returned to L1") {
    return { primary: "Get missing info", detail: "", cls: "badge-warning" };
  }
  if (t.eng_outcome === "Config issue - returned to L1") {
    return { primary: "Apply config fix", detail: "", cls: "badge-purple" };
  }
  if (t.status === "Open - with Engineering") {
    return { primary: "Chase engineering ETA", detail: "", cls: "badge-info" };
  }
  return { primary: subAction, detail: "", cls: "badge-neutral" };
}
