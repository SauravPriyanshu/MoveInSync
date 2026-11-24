import { fmtPct } from "../utils/metrics";

export default function KpiGrid({ kpis }) {
  const cards = [
    {
      label: "Open Tickets Now",
      val: kpis.openCount.toLocaleString(),
      sub: `${kpis.openEng} with Engineering • ${kpis.openL1} with L1 (${kpis.openEsc} escalated)`
    },
    {
      label: "Escalation Rate",
      val: fmtPct(kpis.escShareTickets),
      sub: `${kpis.escalatedCount.toLocaleString()} of ${kpis.total.toLocaleString()} tickets escalated`
    },
    {
      label: "Ticket-Hours vs Ticket Share",
      val: `${fmtPct(kpis.escShareHours)} hrs`,
      sub: `Escalated tickets = ${fmtPct(kpis.escShareTickets)} of tickets (${Math.round(
        kpis.closedEscHours
      ).toLocaleString()}h / ${Math.round(kpis.closedTotalHours).toLocaleString()}h)`,
      bars: [
        {
          label: `Share of ticket-hours (${fmtPct(kpis.escShareHours)})`,
          pct: kpis.escShareHours * 100,
          cls: "danger"
        },
        {
          label: `Share of tickets (${fmtPct(kpis.escShareTickets)})`,
          pct: kpis.escShareTickets * 100,
          cls: ""
        }
      ]
    },
    {
      label: "Median Time-to-Resolve",
      val: `${kpis.medNonEsc !== null ? kpis.medNonEsc.toFixed(1) + "h" : "—"} vs ${
        kpis.medEsc !== null ? kpis.medEsc.toFixed(1) + "h" : "—"
      }`,
      sub: `Non-escalated vs Escalated (${kpis.ttrMultiplier}x slower when escalated)`
    },
    {
      label: "Escalations Not Fixed",
      val: fmtPct(kpis.nonFixedRate),
      sub: `${kpis.nonFixedCount} of ${kpis.escalatedCount} escalated (${kpis.preventableCount} / ${fmtPct(
        kpis.preventableRate
      )} preventable at L1)`
    },
    {
      label: "Reopen Rate & CSAT Impact",
      val: fmtPct(kpis.reopenRate),
      sub: (
        <>
          {kpis.reopenedCount} reopened • CSAT:{" "}
          <strong>{kpis.csatReopened !== null ? kpis.csatReopened.toFixed(2) : "—"}</strong>{" "}
          (reopened) vs{" "}
          <strong>{kpis.csatNotReopened !== null ? kpis.csatNotReopened.toFixed(2) : "—"}</strong>
        </>
      )
    }
  ];

  return (
    <section className="section" style={{ marginTop: 4 }}>
      <div className="section-header">
        <h2 className="section-title">1. Control Tower Overview</h2>
        <span className="section-desc">
          Live metrics computed in-browser &bull; Snapshot as of 30 Sep 2026 (23:59 IST)
        </span>
      </div>
      <div className="kpi-grid">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-val">{c.val}</div>
            <div className="kpi-sub">{c.sub}</div>
            {c.bars && (
              <div className="kpi-bar-wrap">
                {c.bars.map((b) => (
                  <div key={b.label}>
                    <div>{b.label}</div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${b.cls}`}
                        style={{ width: `${Math.min(100, b.pct).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
