import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import defaultCsvRaw from "../rideops_support_tickets.csv?raw";
import Header from "./components/Header";
import KpiGrid from "./components/KpiGrid";
import OutcomeTable from "./components/OutcomeTable";
import AgentTable from "./components/AgentTable";
import PreEscalationGate from "./components/PreEscalationGate";
import LiveQueue from "./components/LiveQueue";
import {
  computeAgents,
  computeKpis,
  computeOutcomes,
  processTickets
} from "./utils/metrics";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [sourceLabel, setSourceLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("rideops_theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rideops_theme", theme);
  }, [theme]);

  const parseCsvText = useCallback((csvText, label) => {
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });
    const rows = processTickets(parsed.data || []);
    if (!rows.length) {
      setErrorMsg("CSV parsed with 0 valid rows.");
      return;
    }
    setTickets(rows);
    setSourceLabel(label);
    setErrorMsg("");
  }, []);

  const loadDefaultCsv = useCallback(async () => {
    try {
      const resp = await fetch("./rideops_support_tickets.csv", { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      parseCsvText(text, "rideops_support_tickets.csv");
    } catch {
      if (defaultCsvRaw) {
        parseCsvText(defaultCsvRaw, "Built-in CSV");
      } else {
        setErrorMsg("Could not load default CSV. Use Upload CSV above.");
      }
    }
  }, [parseCsvText]);

  useEffect(() => {
    loadDefaultCsv();
  }, [loadDefaultCsv]);

  const handleUploadFile = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (ev) => parseCsvText(ev.target.result, file.name);
      reader.readAsText(file);
    },
    [parseCsvText]
  );

  const kpis = useMemo(() => computeKpis(tickets), [tickets]);
  const outcomes = useMemo(() => computeOutcomes(tickets), [tickets]);
  const agents = useMemo(() => computeAgents(tickets), [tickets]);

  return (
    <>
      <Header
        ticketCount={tickets.length}
        sourceLabel={sourceLabel}
        errorMsg={errorMsg}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onUploadFile={handleUploadFile}
        onReloadDefault={loadDefaultCsv}
      />
      <main className="container">
        {errorMsg && (
          <div className="banner warn">
            <div>
              <strong>Could not load CSV.</strong> <span className="muted">{errorMsg}</span>
            </div>
            <label className="btn btn-primary file-label">
              Select CSV File
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}

        {tickets.length > 0 && (
          <>
            <KpiGrid kpis={kpis} />
            <OutcomeTable data={outcomes} />
            <AgentTable agents={agents} />
            <PreEscalationGate tickets={tickets} />
            <LiveQueue tickets={tickets} />
          </>
        )}
      </main>
    </>
  );
}
