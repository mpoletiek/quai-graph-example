import { useEffect, useState } from "react";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [
        import("@shikijs/langs/yaml"),
        import("@shikijs/langs/graphql"),
        import("@shikijs/langs/typescript"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

// Raw imports keep the displayed code as the real, on-disk source.
import manifestSrc from "../../my-subgraph/subgraph.yaml?raw";
import schemaSrc from "../../my-subgraph/schema.graphql?raw";
import mappingSrc from "../../my-subgraph/src/mapping.ts?raw";
import composeSrc from "../../my-subgraph/docker-compose.yml?raw";

const FILES: { path: string; lang: string; source: string; explain: string }[] = [
  {
    path: "my-subgraph/subgraph.yaml",
    lang: "yaml",
    source: manifestSrc,
    explain:
      "The manifest tells Graph Node what to index. The important bits: network: quai (matches the network configured on graph.quai.network), the contract address (Wrapped Qi on Cyprus-1), and the event handler binding Transfer(address,address,uint256) → handleTransfer.",
  },
  {
    path: "my-subgraph/schema.graphql",
    lang: "graphql",
    source: schemaSrc,
    explain:
      "Entities the subgraph will store and serve via GraphQL. Account.transfersSent and transfersReceived use @derivedFrom so they're materialized automatically from the Transfer side — no manual back-references.",
  },
  {
    path: "my-subgraph/src/mapping.ts",
    lang: "typescript",
    source: mappingSrc,
    explain:
      "An AssemblyScript handler. For every Transfer log emitted by the contract, we upsert both Account records, adjust balances, and write an immutable Transfer entity. The Token entity gets lazy-initialized via on-chain calls (name/symbol/decimals).",
  },
  {
    path: "my-subgraph/docker-compose.yml",
    lang: "yaml",
    source: composeSrc,
    explain:
      "If you don't have write access to https://graph.quai.network/deploy, spin up a local Graph Node, IPFS, and Postgres. It points at the public Quai Cyprus-1 RPC and gives you a private GraphQL endpoint at http://localhost:8000 to develop against.",
  },
];

export function BuildYourOwn() {
  return (
    <div>
      <div className="panel">
        <h2>Anatomy of a subgraph</h2>
        <p>A subgraph is three files plus an ABI:</p>
        <ol>
          <li><code>subgraph.yaml</code> — the manifest (what to index, from where)</li>
          <li><code>schema.graphql</code> — the entities you'll query</li>
          <li><code>src/mapping.ts</code> — AssemblyScript handlers that turn on-chain events into entity writes</li>
        </ol>
        <p>
          The example in <code>my-subgraph/</code> indexes ERC-20 <code>Transfer</code> events from{" "}
          <strong>Wrapped Qi (WQI)</strong> at{" "}
          <code className="mono">0x002b2596ecf05c93a31ff916e8b456df6c77c750</code> on Cyprus-1.
        </p>
      </div>

      {FILES.map((f) => (
        <FileBlock key={f.path} {...f} />
      ))}

      <div className="panel">
        <h2>Build &amp; deploy</h2>
        <h3>Option A — deploy to graph.quai.network</h3>
        <p className="muted">
          The <code>/deploy</code> port may be admin-gated. If you don't have access, use Option B.
        </p>
        <pre className="result">{`cd my-subgraph
npm install
npm run codegen
npm run build

# one-time
graph create wqi-transfers --node https://graph.quai.network/deploy

# every release
graph deploy \\
  --node https://graph.quai.network/deploy \\
  --ipfs https://ipfs.qu.ai \\
  wqi-transfers`}</pre>

        <h3 style={{ marginTop: 24 }}>Option B — run a local Graph Node</h3>
        <p className="muted">Always works. Indexes against the public Cyprus-1 RPC.</p>
        <pre className="result">{`cd my-subgraph
docker compose up -d              # graph-node + ipfs + postgres
npm install
npm run codegen
npm run build
npm run create-local
npm run deploy-local
# query at http://localhost:8000/subgraphs/name/wqi-transfers`}</pre>

        <div className="callout">
          Once deployed, point this app at the new endpoint by setting{" "}
          <code>VITE_GRAPH_URL</code> in <code>.env</code> and restarting{" "}
          <code>npm run dev</code>. The Playground tab works against any subgraph URL.
        </div>
      </div>
    </div>
  );
}

function FileBlock({ path, lang, source, explain }: { path: string; lang: string; source: string; explain: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((hl) => {
      if (cancelled) return;
      setHtml(
        hl.codeToHtml(source, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        }),
      );
    });
    return () => { cancelled = true; };
  }, [source, lang]);

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{path}</h2>
      </div>
      <p className="muted">{explain}</p>
      <div className="code-block">
        <div className="filename">{path}</div>
        <div dangerouslySetInnerHTML={{ __html: html || `<pre><code>${escapeHtml(source)}</code></pre>` }} />
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
