import { useMemo, useState } from "react";
import { fmtPct } from "../utils/metrics";

export default function AgentTable({ agents }) {
  const [sort, setSort] = useState({ key: "escRatio", dir: "desc" });

  const sorted = useMemo(() => {
    return [...agents].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const na = av ?? -Infinity;
      const nb = bv ?? -Infinity;
      return sort.dir === "asc" ? na - nb : nb - na;
    });
  }, [agents, sort]);

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "agent" ? "asc" : "desc" }
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">3. L1 Agent Escalation &amp; Quality Audit</h2>
        <span className="section-desc">
          Expected escalation = peer rate weighted by each agent&apos;s category mix &bull; Click
          headers to sort
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort("agent")}>Agent</th>
              <th className="num sortable" onClick={() => handleSort("tickets")}>Tickets</th>
              <th className="num sortable" onClick={() => handleSort("escRate")}>Escalation Rate</th>
              <th className="num sortable" onClick={() => handleSort("expectedEscRate")}>Expected Esc. Rate</th>
              <th className="num sortable" onClick={() => handleSort("escRatio")}>Esc. vs Expected</th>
              <th className="num sortable" onClick={() => handleSort("medianFirstClose")}>Median First-Close</th>
              <th className="num sortable" onClick={() => handleSort("reopenRate")}>Reopen Rate</th>
              <th className="num sortable" onClick={() => handleSort("avgCsat")}>Avg CSAT</th>
              <th>Coaching Flag</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.agent}>
                <td>
                  <strong>{r.agent}</strong>
                </td>
                <td className="num">{r.tickets}</td>
                <td className="num">
                  <strong>{fmtPct(r.escRate)}</strong>
                </td>
                <td className="num">{fmtPct(r.expectedEscRate)}</td>
                <td className="num">
                  <span className={`badge ${r.escRatio > 1.4 ? "badge-danger" : "badge-neutral"}`}>
                    {r.escRatio.toFixed(2)}x
                  </span>
                </td>
                <td className="num">
                  {r.medianFirstClose !== null ? `${r.medianFirstClose.toFixed(1)}h` : "—"}
                </td>
                <td className="num">
                  <span className={r.reopenRatio > 2.0 ? "badge badge-warning" : ""}>
                    {fmtPct(r.reopenRate)}
                  </span>{" "}
                  <span className="muted">({r.reopenRatio.toFixed(1)}x peers)</span>
                </td>
                <td className="num">{r.avgCsat !== null ? r.avgCsat.toFixed(2) : "—"}</td>
                <td>
                  {r.flags.length ? (
                    r.flags.map((f) => (
                      <span key={f.text} className={`badge ${f.cls}`} style={{ marginRight: 4 }}>
                        {f.text}
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-success">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
