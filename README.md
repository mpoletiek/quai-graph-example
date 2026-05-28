# Quai Graph Example

A self-contained example app demonstrating how to query the
[Quai Network Graph Node](https://graph.quai.network/) and how to author
your own subgraph against Quai Mainnet (Cyprus-1).

One `npm run dev` launches a four-tab teaching UI:

| Tab | What it does |
| --- | --- |
| **Overview** | What `graph.quai.network` is, the `Block` schema exposed by the live `quai-blocks` subgraph, copy-pasteable `curl` examples, and a callout on combining selections to avoid rate limits |
| **Live Blocks** | Polls the live endpoint every 5s — latest 20 blocks, gas-used sparkline, derived avg block time, indexer health |
| **Query Playground** | Mini GraphQL editor with preset queries covering pagination, filtering, ordering, `_meta`, and combined selections |
| **Build Your Own** | Annotated walkthrough of [`my-subgraph/`](./my-subgraph) — a real, buildable subgraph that indexes Wrapped Qi (WQI) ERC-20 transfers — with deploy commands for both the hosted node and a local Graph Node stack |

The code displayed in the **Build Your Own** tab is loaded directly from the
files in `my-subgraph/` via Vite raw imports, so what you read in the UI is
always the actual on-disk source.

---

## Quick start

```bash
git clone https://github.com/dominant-strategies/quai-graph-example
cd quai-graph-example
npm install
npm run dev
```

The app opens at <http://localhost:5173> and queries the live
`quai-blocks` subgraph by default.

To point at a different deployment (your own, or a local Graph Node):

```bash
cp .env.example .env
# edit VITE_GRAPH_URL
npm run dev
```

---

## Repository layout

```
.
├── src/                      # Vite + React + TS teaching app
│   ├── App.tsx               # tab shell + light/dark toggle
│   ├── lib/
│   │   ├── client.ts         # graphql-request client (reads VITE_GRAPH_URL)
│   │   └── queries.ts        # GraphQL queries + Playground presets
│   ├── tabs/
│   │   ├── Overview.tsx
│   │   ├── LiveBlocks.tsx    # polling + KPIs + sparkline
│   │   ├── Playground.tsx    # mini-GraphiQL
│   │   └── BuildYourOwn.tsx  # imports my-subgraph/* as raw text
│   └── styles.css            # Quai brand palette + light/dark themes
├── public/
│   ├── brand/quai-mark.svg   # Quai logo mark (favicon + header)
│   └── fonts/                # Bai Jamjuree, Monorama, Yapari (see NOTICES.md)
└── my-subgraph/              # the example subgraph (WQI transfer indexer)
    ├── subgraph.yaml         # network: quai, source.address: WQI on Cyprus-1
    ├── schema.graphql        # Token, Account, Transfer entities
    ├── src/mapping.ts        # AssemblyScript handleTransfer
    ├── abis/ERC20.json
    ├── docker-compose.yml    # local graph-node + ipfs + postgres
    └── README.md
```

---

## The example subgraph

[`my-subgraph/`](./my-subgraph) is a working subgraph that indexes
`Transfer` events from **Wrapped Qi (WQI)** at
`0x002b2596ecf05c93a31ff916e8b456df6c77c750` on Quai Cyprus-1.

It produces three entities:

- `Token` — name, symbol, decimals, transfer count (initialized via on-chain calls)
- `Account` — per-wallet balance and counters, with `@derivedFrom` reverse lookups
- `Transfer` — immutable record of every transfer

### Build

```bash
cd my-subgraph
npm install
npm run codegen
npm run build
```

### Deploy — hosted (`graph.quai.network`)

The `/deploy` admin port may require permission from Dominant Strategies.
If you have access:

```bash
npm run create-mainnet
npm run deploy-mainnet
# query at https://graph.quai.network/subgraphs/name/wqi-transfers
```

### Deploy — local (always works)

```bash
docker compose up -d           # graph-node + ipfs + postgres
npm run create-local
npm run deploy-local
# query at http://localhost:8000/subgraphs/name/wqi-transfers
```

To point the teaching app at your local deployment:

```bash
echo 'VITE_GRAPH_URL=http://localhost:8000/subgraphs/name/wqi-transfers' > ../.env
cd .. && npm run dev
```

---

## Network specs

| | Mainnet | Orchard Testnet |
| --- | --- | --- |
| Chain ID | `9` | `15000` |
| RPC | `https://rpc.quai.network/cyprus1` | `https://orchard.rpc.quai.network/cyprus1` |
| Graph Node | `https://graph.quai.network` | `https://orchard.graph.quai.network` |
| Explorer | <https://quaiscan.io> | <https://orchard.quaiscan.io> |

Cyprus-1 is currently the only active zone on Quai. The Prime and Region
chains are header-only coordination layers and carry no state — see the
[hierarchical structure docs](https://docs.qu.ai/learn/advanced-introduction/hierarchical-structure/hierarchical-structure).

---

## Resources

- [Quai Network documentation](https://docs.qu.ai/)
- [`dominant-strategies/go-quai`](https://github.com/dominant-strategies/go-quai) — the reference node implementation
- [`dominant-strategies/quai-blocks-subgraph`](https://github.com/dominant-strategies/quai-blocks-subgraph) — the upstream subgraph this app queries by default
- [The Graph — subgraph development](https://thegraph.com/docs/en/developing/creating-a-subgraph/)
- [Quaiscan](https://quaiscan.io) — block explorer

---

## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE),
matching [`dominant-strategies/go-quai`](https://github.com/dominant-strategies/go-quai/blob/main/LICENSE).

Brand assets (logo mark, brand fonts) bundled in `public/` are subject to
separate terms — see [NOTICES.md](./NOTICES.md) before redistributing this
repository under a different organization.
