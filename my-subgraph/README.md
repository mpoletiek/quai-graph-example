# wqi-transfers subgraph

Indexes ERC-20 `Transfer` events from **Wrapped Qi (WQI)** at
`0x002b2596ecf05c93a31ff916e8b456df6c77c750` on Quai Cyprus-1.

Files:
- `subgraph.yaml` — manifest
- `schema.graphql` — `Token`, `Account`, `Transfer` entities
- `src/mapping.ts` — `handleTransfer`
- `abis/ERC20.json` — minimal ERC-20 ABI
- `docker-compose.yml` — local Graph Node stack for offline development

## Build

```bash
npm install
npm run codegen   # generates ./generated from schema + ABIs
npm run build     # produces ./build with the WASM mappings
```

## Deploy — Option A (hosted, requires access)

```bash
npm run create-mainnet
npm run deploy-mainnet
# query at https://graph.quai.network/subgraphs/name/wqi-transfers
```

## Deploy — Option B (local, always works)

```bash
docker compose up -d
npm run create-local
npm run deploy-local
# query at http://localhost:8000/subgraphs/name/wqi-transfers
```

Point the parent web app at your new deployment:

```bash
echo 'VITE_GRAPH_URL=http://localhost:8000/subgraphs/name/wqi-transfers' > ../.env
cd .. && npm run dev
```

## Example queries

```graphql
{
  token(id: "0x002b2596ecf05c93a31ff916e8b456df6c77c750") {
    name symbol decimals totalTransfers
  }
  transfers(first: 10, orderBy: blockNumber, orderDirection: desc) {
    from { id }
    to { id }
    amount
    blockNumber
  }
}
```
