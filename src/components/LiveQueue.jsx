import { useMemo, useState } from "react";
import { fmtAge, getNextAction, PRIO_ORDER } from "../utils/metrics";

const FILTERS = [
  { id: "all", label: "All Open" },
  { id: "eng", label: "Open - with Engineering" },
  { id: "l1", label: "Open - with L1" },
  { id: "multi", label: "2+ Handoffs (Lead Escalation)" }
];

export default function LiveQueue({ tickets }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { totalOpenCount, filtered, displayed } = useMemo(() => {
    let open = tickets
      .filter((t) => t.isOpen)
      .sort((a, b) => {
        const pa = PRIO_ORDER[a.priority] || 99;
        const pb = PRIO_ORDER[b.priority] || 99;
        if (pa !== pb) return pa - pb;
        if (b.handoffs !== a.handoffs) return b.handoffs - a.handoffs;
        return b.ageHours - a.ageHours;
      });

    const totalOpen = open.length;
    if (filter === "eng") open = open.filter((t) => t.status === "Open - with Engineering");
    else if (filter === "l1") open = open.filter((t) => t.status === "Open - with L1");
    else if (filter === "multi") open = open.filter((t) => t.handoffs >= 2);

    const q = search.trim().toLowerCase();
    if (q) {
      open = open.filter((t) =>
        [
          t.ticket_id,
          t.eng_ticket_id,
          t.client_name,
          t.assigned_agent,
          t.category,
          t.description,
          t.eng_outcome
        ].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    return {
      totalOpenCount: totalOpen,
      filtered: open,
      displayed: showAll ? open : open.slice(0, 25)
    };
  }, [tickets, filter, search, showAll]);

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">5. Live Open Ticket Queue</h2>
        <span className="section-desc">
          Sorted by Priority (P1&rarr;P4), then Eng Handoffs (desc), then Age (oldest first)
        </span>
      </div>
      <div className="toolbar">
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`pill-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <input
            type="search"
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket, client, agent, issue..."
          />
          <button
            type="button"
            className="btn btn-sm"
            disabled={filtered.length <= 25}
            onClick={() => setShowAll((prev) => !prev)}
          >
            {filtered.length <= 25
              ? `Showing ${filtered.length} of ${totalOpenCount} open`
              : showAll
              ? `Showing All ${filtered.length} (Collapse to Top 25)`
              : `Showing Top 25 of ${filtered.length} (Show All)`}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Priority</th>
              <th>Age</th>
              <th>Status</th>
              <th>Client</th>
              <th>Category &amp; Issue</th>
              <th>Agent</th>
              <th className="num">Handoffs</th>
              <th>Eng Outcome</th>
              <th>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length ? (
              displayed.map((t) => {
                const action = getNextAction(t);
                return (
                  <tr key={t.ticket_id}>
                    <td>
                      <strong>{t.ticket_id}</strong>
                      {t.eng_ticket_id && <div className="muted">{t.eng_ticket_id}</div>}
                    </td>
                    <td>
                      <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtAge(t.ageHours)}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === "Open - with Engineering" ? "badge-info" : "badge-neutral"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <strong>{t.client_name}</strong>
                      <div className="muted">{t.client_tier}</div>
                    </td>
                    <td style={{ maxWidth: 300 }}>
                      <div style={{ fontWeight: 600 }}>{t.category}</div>
                      <div className="muted">{t.description}</div>
                    </td>
                    <td>{t.assigned_agent}</td>
                    <td className="num">
                      {t.handoffs >= 2 ? (
                        <span className="badge badge-danger">{t.handoffs}</span>
                      ) : (
                        t.handoffs
                      )}
                    </td>
                    <td>{t.eng_outcome || <span className="muted">—</span>}</td>
                    <td>
                      <span className={`badge ${action.cls}`}>{action.primary}</span>
                      {action.detail && (
                        <div className="muted" style={{ marginTop: 3 }}>
                          + {action.detail}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="muted" style={{ textAlign: "center", padding: 24 }}>
                  No open tickets match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
