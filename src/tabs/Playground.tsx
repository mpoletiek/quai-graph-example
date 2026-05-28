import { useState } from "react";
import { runQuery } from "../lib/client";
import { PRESETS } from "../lib/queries";

export function Playground() {
  const [query, setQuery] = useState<string>(PRESETS[0].query);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const data = await runQuery(query);
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      const err = e as Error & { response?: unknown };
      setError(err.message);
      setResult(err.response ? JSON.stringify(err.response, null, 2) : "");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="panel">
        <h2>Run a GraphQL query</h2>
        <p className="muted">
          Edit the query below and hit Run. The presets walk through pagination, filtering, ordering, and indexer metadata.
        </p>

        <div className="row">
          <label className="muted" style={{ fontSize: 13 }}>Preset:</label>
          <select
            className="preset-select"
            onChange={(e) => {
              const p = PRESETS.find((p) => p.label === e.target.value);
              if (p) { setQuery(p.query); setResult(""); setError(null); }
            }}
            defaultValue={PRESETS[0].label}
          >
            {PRESETS.map((p) => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <button className="run" onClick={run} disabled={running}>
            {running ? "Running…" : "Run query"}
          </button>
        </div>

        <textarea
          className="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="panel">
        <h3>Result</h3>
        {error && <div className="error" style={{ marginBottom: 8 }}>Error: {error}</div>}
        <pre className="result">{result || (running ? "…" : "// run a query to see the response")}</pre>
      </div>
    </div>
  );
}
