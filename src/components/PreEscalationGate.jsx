import { useEffect, useMemo, useState } from "react";
import { CATEGORY_CHECKLISTS, DEFAULT_CHECKLIST, fmtPct } from "../utils/metrics";

export default function PreEscalationGate({ tickets }) {
  const categories = useMemo(
    () => [...new Set(tickets.map((t) => t.category).filter(Boolean))].sort(),
    [tickets]
  );

  const [category, setCategory] = useState("");
  const [grouped, setGrouped] = useState(true);
  const [descKey, setDescKey] = useState("");
  const [checkedMap, setCheckedMap] = useState({});

  useEffect(() => {
    if (!categories.length) return;
    if (!category || !categories.includes(category)) {
      setCategory(
        categories.includes("Roster / booking not syncing")
          ? "Roster / booking not syncing"
          : categories[0]
      );
    }
  }, [categories, category]);

  const descOptions = useMemo(() => {
    if (!category) return [];
    const counts = new Map();
    for (const t of tickets) {
      if (t.category !== category) continue;
      const key = grouped ? t.descGroup : t.description;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tickets, category, grouped]);

  useEffect(() => {
    if (!descOptions.length) {
      setDescKey("");
      return;
    }
    if (!descOptions.some(([d]) => d === descKey)) {
      setDescKey(descOptions[0][0]);
    }
  }, [descOptions, descKey]);

  useEffect(() => {
    setCheckedMap({});
  }, [category, descKey]);

  const stats = useMemo(() => {
    const matching = tickets.filter(
      (t) => t.category === category && (grouped ? t.descGroup === descKey : t.description === descKey)
    );
    const esc = matching.filter((t) => t.isEscalated);
    const fixed = esc.filter((t) => t.eng_outcome === "Fixed");
    const nonFixed = esc.filter((t) => t.eng_outcome !== "Fixed");
    const escRate = matching.length ? esc.length / matching.length : 0;
    const nonFixedShare = esc.length ? nonFixed.length / esc.length : 0;

    const outCounts = new Map();
    for (const t of esc) {
      const k = t.eng_outcome || "(Blank)";
      outCounts.set(k, (outCounts.get(k) || 0) + 1);
    }
    const breakdown = [...outCounts.entries()].sort((a, b) => b[1] - a[1]);

    return {
      total: matching.length,
      escCount: esc.length,
      fixedCount: fixed.length,
      nonFixedCount: nonFixed.length,
      escRate,
      nonFixedShare,
      hold: nonFixedShare > 0.5,
      breakdown
    };
  }, [tickets, category, descKey, grouped]);

  const checklistItems = CATEGORY_CHECKLISTS[category] || DEFAULT_CHECKLIST;
  const checkedCount = checklistItems.filter((_, idx) => checkedMap[idx]).length;

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">4. Pre-Escalation Gate for L1 Agents</h2>
        <span className="section-desc">
          Check historical fix rate &amp; required L1 diagnostic evidence before creating an ENG ticket
        </span>
      </div>
      <div className="gate-grid">
        <div className="card">
          <div className="form-row">
            <div>
              <label className="field-label" htmlFor="gateCategory">
                Issue Category
              </label>
              <select
                id="gateCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="gateDescription">
                Issue Description
              </label>
              <select
                id="gateDescription"
                value={descKey}
                onChange={(e) => setDescKey(e.target.value)}
              >
                {descOptions.map(([d, cnt]) => (
                  <option key={d} value={d}>
                    {d} ({cnt} tickets)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="toggle-inline">
            <input
              type="checkbox"
              checked={grouped}
              onChange={(e) => setGrouped(e.target.checked)}
            />
            Group variable counts/routes (e.g., <code>&lt;N&gt; employees</code>,{" "}
            <code>route &lt;N&gt;</code>)
          </label>

          <div className={`verdict-box ${stats.hold ? "hold" : "ok"}`}>
            {stats.hold ? (
              <>
                <div className="verdict-title">Hold: work the checklist at L1 first</div>
                <div className="muted">
                  {stats.nonFixedCount} of {stats.escCount} past escalations (
                  {fmtPct(stats.nonFixedShare)}) were <strong>not Fixed</strong> by Engineering
                  (returned for info/config, duplicate, or how-to).
                </div>
              </>
            ) : (
              <>
                <div className="verdict-title">Escalate once checklist complete</div>
                <div className="muted">
                  {stats.escCount === 0
                    ? "0 past escalations for this issue — verify L1 resolution first; escalate only if checklist evidence confirms a new bug."
                    : `${stats.fixedCount} of ${stats.escCount} past escalations (${fmtPct(
                        1 - stats.nonFixedShare
                      )}) required an Engineering fix; ${fmtPct(stats.nonFixedShare)} were non-Fixed.`}
                </div>
              </>
            )}
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <div className="label">Past Tickets</div>
              <div className="val">{stats.total}</div>
            </div>
            <div className="mini-stat">
              <div className="label">Escalation Rate</div>
              <div className="val">
                {fmtPct(stats.escRate)}{" "}
                <span className="muted" style={{ fontWeight: 500 }}>
                  ({stats.escCount})
                </span>
              </div>
            </div>
            <div className="mini-stat">
              <div className="label">Non-Fixed Share</div>
              <div className="val">{stats.escCount ? fmtPct(stats.nonFixedShare) : "0.0%"}</div>
            </div>
          </div>

          <div className="kpi-label" style={{ marginBottom: 8 }}>
            Past Engineering Outcomes for Selected Issue
          </div>
          <div className="outcome-bars">
            {!stats.escCount ? (
              <div className="muted">No historical escalations for this issue.</div>
            ) : (
              stats.breakdown.map(([out, cnt]) => {
                const pct = (cnt / stats.escCount) * 100;
                const isFixed = out === "Fixed";
                return (
                  <div className="outcome-bar-row" key={out}>
                    <span>{out}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${isFixed ? "success" : "warning"}`}
                        style={{ width: `${pct.toFixed(1)}%` }}
                      />
                    </div>
                    <span className="num">
                      {cnt} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              gap: 8
            }}
          >
            <div>
              <div className="kpi-label" style={{ marginBottom: 2 }}>
                Required L1 Pre-Escalation Checklist
              </div>
              <div className="muted">{category}</div>
            </div>
            <span
              className={`badge ${
                checklistItems.length && checkedCount === checklistItems.length
                  ? "badge-success"
                  : "badge-neutral"
              }`}
            >
              {checkedCount} / {checklistItems.length} checked
            </span>
          </div>

          <ul className="checklist">
            {checklistItems.map((item, idx) => (
              <li key={item}>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(checkedMap[idx])}
                    onChange={(e) =>
                      setCheckedMap((prev) => ({ ...prev, [idx]: e.target.checked }))
                    }
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCheckedMap({})}
            >
              Reset Checklist
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
