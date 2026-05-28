import { useEffect, useMemo, useState } from "react";
import { runQuery } from "../lib/client";
import { LIVE_TICK, type Block } from "../lib/queries";

type Meta = {
  block: { number: number; hash: string };
  deployment: string;
  hasIndexingErrors: boolean;
};

type TickResp = { blocks: Block[]; _meta: Meta };

const POLL_MS = 5000;

export function LiveBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let id: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      setLoading(true);
      try {
        const data = await runQuery<TickResp>(
          LIVE_TICK,
          { first: 20 },
          controller.signal,
        );
        if (cancelled) return;
        setBlocks(data.blocks);
        setMeta(data._meta);
        setError(null);
        setLastFetched(Date.now());
      } catch (e) {
        if (cancelled) return;
        const err = e as Error;
        if (err.name === "AbortError") return;
        // Keep last-good data on screen; just surface a small status message.
        setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          id = setTimeout(tick, POLL_MS);
        }
      }
    }

    tick();
    return () => {
      cancelled = true;
      controller.abort();
      if (id) clearTimeout(id);
    };
  }, []);

  const stats = useMemo(() => computeStats(blocks), [blocks]);

  const hasData = blocks.length > 0;
  // Only show the big error panel when we've never successfully loaded.
  // Once we have data, transient failures become a small inline badge.
  const showFatalError = !!error && !hasData;
  const showTransientError = !!error && hasData;

  return (
    <div>
      {showFatalError && (
        <div className="panel" style={{ borderColor: "var(--danger)" }}>
          <span className="error">Error: {error}</span>
          <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
            Retrying every {POLL_MS / 1000}s…
          </div>
        </div>
      )}

      <div className="kpis">
        <Kpi label="Head block" value={meta ? `#${meta.block.number}` : "—"} />
        <Kpi label="Avg block time" value={stats.avgBlockTime ? `${stats.avgBlockTime.toFixed(2)}s` : "—"} />
        <Kpi label="Gas used (last 20)" value={stats.totalGas.toLocaleString()} />
        <Kpi
          label="Indexer healthy"
          value={meta ? (meta.hasIndexingErrors ? "errors" : "ok") : "—"}
        />
      </div>

      <div className="panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Gas used per block (sparkline)</h2>
          <span className="muted" style={{ fontSize: 12 }}>
            Polling every {POLL_MS / 1000}s · last update{" "}
            {lastFetched ? new Date(lastFetched).toLocaleTimeString() : "—"}
            {loading && " · refreshing…"}
            {showTransientError && (
              <span className="error" style={{ marginLeft: 8 }}>
                · retry pending ({error})
              </span>
            )}
          </span>
        </div>
        <Sparkline values={[...blocks].reverse().map((b) => Number(b.gasUsed ?? 0))} />
      </div>

      <div className="panel">
        <h2>Latest 20 blocks</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Miner</th>
              <th style={{ textAlign: "right" }}>Gas used</th>
              <th style={{ textAlign: "right" }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.id}>
                <td className="mono">{b.number}</td>
                <td>{fmtTime(b.timestamp)}</td>
                <td className="mono">{shortAddr(b.author)}</td>
                <td className="mono" style={{ textAlign: "right" }}>{Number(b.gasUsed ?? 0).toLocaleString()}</td>
                <td className="mono" style={{ textAlign: "right" }}>{Number(b.size ?? 0).toLocaleString()}</td>
              </tr>
            ))}
            {blocks.length === 0 && (
              <tr><td colSpan={5} className="muted">Loading…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="muted" style={{ padding: 20 }}>Need at least 2 blocks…</div>;
  }
  const w = 1000, h = 120, pad = 8;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 120, display: "block" }}>
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={points} />
    </svg>
  );
}

function computeStats(blocks: Block[]) {
  if (blocks.length < 2) return { avgBlockTime: 0, totalGas: 0 };
  const ts = blocks.map((b) => Number(b.timestamp));
  const deltas: number[] = [];
  for (let i = 0; i < ts.length - 1; i++) deltas.push(ts[i] - ts[i + 1]);
  const avgBlockTime = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const totalGas = blocks.reduce((sum, b) => sum + Number(b.gasUsed ?? 0), 0);
  return { avgBlockTime, totalGas };
}

function fmtTime(ts: string) {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleTimeString();
}

function shortAddr(a: string | null) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
