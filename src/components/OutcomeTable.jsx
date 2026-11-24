import { fmtHours, fmtPct } from "../utils/metrics";

export default function OutcomeTable({ data }) {
  const { rows, totals } = data;
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">2. Escalations by Engineering Outcome</h2>
        <span className="section-desc">
          Where escalated hours go &amp; which outcomes are preventable at L1
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Engineering Outcome</th>
              <th className="num">Escalations</th>
              <th className="num">Avg Handoffs</th>
              <th className="num">Median TTR</th>
              <th className="num">Avg CSAT</th>
              <th className="num">Share of Escalated Hours</th>
              <th>Preventable at L1?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.outcome}>
                <td>
                  <strong>{r.outcome}</strong>
                </td>
                <td className="num">
                  {r.count} <span className="muted">({fmtPct(r.pctCount)})</span>
                </td>
                <td className="num">{r.avgHo !== null ? r.avgHo.toFixed(2) : "—"}</td>
                <td className="num">{r.medTtr !== null ? fmtHours(r.medTtr) : "—"}</td>
                <td className="num">{r.avgCsat !== null ? r.avgCsat.toFixed(2) : "—"}</td>
                <td className="num">
                  <div className="inline-bar">
                    <span className="mini-track">
                      <span
                        style={{
                          width: `${(r.shareHrs * 100).toFixed(1)}%`,
                          background: r.preventable ? "var(--danger)" : "var(--primary)"
                        }}
                      />
                    </span>
                    <span>{fmtPct(r.shareHrs)}</span>
                  </div>
                </td>
                <td>
                  {r.preventable ? (
                    <span className="badge badge-warning">Yes (L1 preventable)</span>
                  ) : (
                    <span className="badge badge-neutral">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total / All Escalations</td>
              <td className="num">{totals.count} (100%)</td>
              <td className="num">{totals.avgHo !== null ? totals.avgHo.toFixed(2) : "—"}</td>
              <td className="num">{totals.medTtr !== null ? fmtHours(totals.medTtr) : "—"}</td>
              <td className="num">{totals.avgCsat !== null ? totals.avgCsat.toFixed(2) : "—"}</td>
              <td className="num">100.0%</td>
              <td>
                <span className="badge badge-danger">
                  {totals.prevCount} preventable ({fmtPct(totals.prevPctCount)},{" "}
                  {fmtPct(totals.prevPctHrs)} hrs)
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
