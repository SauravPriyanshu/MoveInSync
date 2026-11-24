export default function Header({
  ticketCount,
  sourceLabel,
  errorMsg,
  theme,
  onToggleTheme,
  onUploadFile,
  onReloadDefault
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-icon">RO</div>
          <div>
            <h1>RideOps Escalation Control Tower</h1>
            <div className="brand-sub">
              {ticketCount > 0
                ? `${ticketCount.toLocaleString()} tickets (2 Jul – 30 Sep 2026) • Snapshot: 30 Sep 2026${
                    sourceLabel ? ` • Source: ${sourceLabel}` : ""
                  }`
                : "Loading rideops_support_tickets.csv... | Snapshot: 30 Sep 2026"}
            </div>
          </div>
        </div>
        <div className="controls">
          <span className={`status-pill ${errorMsg ? "error" : ""}`}>
            {errorMsg ? "CSV not loaded" : ticketCount > 0 ? `${ticketCount.toLocaleString()} tickets loaded` : "Loading..."}
          </span>
          <label className="btn file-label" title="Upload a CSV file manually">
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadFile(file);
                e.target.value = "";
              }}
            />
          </label>
          <button className="btn" type="button" onClick={onReloadDefault}>
            Reload Default CSV
          </button>
          <button
            className="btn"
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </header>
  );
}
