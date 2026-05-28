import { GRAPH_URL } from "../lib/client";

export function Overview() {
  return (
    <div>
      <div className="panel">
        <h2>What is this?</h2>
        <p>
          Quai Network hosts a{" "}
          <a href="https://thegraph.com/docs/en/indexing/tooling/graph-node/" target="_blank" rel="noreferrer">
            Graph Node
          </a>{" "}
          at <code>graph.quai.network</code>. It indexes the{" "}
          <strong>Cyprus-1 zone</strong> of Quai Mainnet (the only stateful
          chain) and serves the data over GraphQL via deployed{" "}
          <em>subgraphs</em>.
        </p>
        <p>
          This app talks to a live subgraph called <code>quai-blocks</code>,
          which indexes every block header on Cyprus-1.
        </p>
      </div>

      <div className="panel">
        <h2>The live endpoint</h2>
        <p className="mono">{GRAPH_URL}</p>
        <p>Try it from your terminal:</p>
        <pre className="result">{`curl -s -X POST ${GRAPH_URL} \\
  -H 'Content-Type: application/json' \\
  -d '{"query":"{ _meta { block { number } } }"}'`}</pre>
      </div>

      <div className="panel">
        <h2>The <code>Block</code> entity</h2>
        <p className="muted">
          One entity is exposed by this subgraph. These fields map 1:1 to the
          block header that Quai's go-quai client emits.
        </p>
        <table>
          <thead>
            <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
          </thead>
          <tbody>
            <tr><td className="mono">id</td><td>ID!</td><td>Block hash</td></tr>
            <tr><td className="mono">number</td><td>BigInt!</td><td>Block height on Cyprus-1</td></tr>
            <tr><td className="mono">timestamp</td><td>BigInt!</td><td>Unix seconds</td></tr>
            <tr><td className="mono">parentHash</td><td>String</td><td></td></tr>
            <tr><td className="mono">author</td><td>String</td><td>Miner / coinbase address</td></tr>
            <tr><td className="mono">difficulty</td><td>BigInt</td><td>PoEM block difficulty</td></tr>
            <tr><td className="mono">totalDifficulty</td><td>BigInt</td><td></td></tr>
            <tr><td className="mono">gasUsed</td><td>BigInt</td><td></td></tr>
            <tr><td className="mono">gasLimit</td><td>BigInt</td><td></td></tr>
            <tr><td className="mono">stateRoot</td><td>String</td><td></td></tr>
            <tr><td className="mono">transactionsRoot</td><td>String</td><td></td></tr>
            <tr><td className="mono">receiptsRoot</td><td>String</td><td></td></tr>
            <tr><td className="mono">size</td><td>BigInt</td><td>Block size in bytes</td></tr>
            <tr><td className="mono">unclesHash</td><td>String</td><td></td></tr>
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 12 }}>
          You also get the auto-generated <code>blocks(first, skip, where, orderBy, orderDirection)</code> collection query and <code>_meta</code> for indexer health.
        </p>
      </div>

      <div className="panel">
        <h2>One query, many selections</h2>
        <p>
          A single GraphQL query can ask for multiple top-level fields at once
          — fetch them in one HTTP request instead of fanning out parallel
          requests. This isn't just stylistic: <code>graph.quai.network</code>{" "}
          sits behind Cloudflare with a per-IP rate limit, so parallel requests
          from the same client get 403'd intermittently.
        </p>
        <div className="callout warn">
          <strong>Gotcha I hit building this app:</strong> polling{" "}
          <code>blocks</code> and <code>_meta</code> with{" "}
          <code>Promise.all([...])</code> caused roughly every-other poll to
          fail with HTTP 403. Combining them into one query fixed it
          completely.
        </div>
        <p className="muted" style={{ marginBottom: 6 }}>Do this:</p>
        <pre className="result">{`{
  blocks(first: 5, orderBy: number, orderDirection: desc) {
    number
    timestamp
  }
  _meta {
    block { number }
    hasIndexingErrors
  }
}`}</pre>
        <p className="muted" style={{ marginTop: 12, marginBottom: 6 }}>Not this:</p>
        <pre className="result">{`// Two parallel HTTP requests against the same endpoint.
// Cloudflare will rate-limit you.
await Promise.all([
  client.request(LATEST_BLOCKS),
  client.request(META),
]);`}</pre>
      </div>

      <div className="panel">
        <h2>What's in the next three tabs</h2>
        <ul>
          <li><strong>Live Blocks</strong> — polling demo that proves the endpoint is real, with derived stats.</li>
          <li><strong>Query Playground</strong> — edit GraphQL and run it against the live subgraph.</li>
          <li><strong>Build Your Own</strong> — the anatomy of a subgraph, walked through file-by-file using a real ERC-20 transfer indexer for Wrapped Qi (WQI).</li>
        </ul>
      </div>
    </div>
  );
}
