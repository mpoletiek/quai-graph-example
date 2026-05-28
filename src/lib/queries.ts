export type Block = {
  id: string;
  number: string;
  timestamp: string;
  parentHash: string | null;
  author: string | null;
  difficulty: string | null;
  gasUsed: string | null;
  gasLimit: string | null;
  size: string | null;
};

export const LATEST_BLOCKS = /* GraphQL */ `
  query LatestBlocks($first: Int!) {
    blocks(first: $first, orderBy: number, orderDirection: desc) {
      id
      number
      timestamp
      author
      gasUsed
      gasLimit
      size
    }
  }
`;

export const META = /* GraphQL */ `
  query Meta {
    _meta {
      block {
        number
        hash
      }
      deployment
      hasIndexingErrors
    }
  }
`;

// Combined into one request so we don't trip Cloudflare's per-IP rate
// limit on graph.quai.network (parallel requests get 403'd).
export const LIVE_TICK = /* GraphQL */ `
  query LiveTick($first: Int!) {
    blocks(first: $first, orderBy: number, orderDirection: desc) {
      id
      number
      timestamp
      author
      gasUsed
      gasLimit
      size
    }
    _meta {
      block {
        number
        hash
      }
      deployment
      hasIndexingErrors
    }
  }
`;

export const PRESETS: { label: string; query: string }[] = [
  {
    label: "Latest 5 blocks",
    query: `{
  blocks(first: 5, orderBy: number, orderDirection: desc) {
    number
    timestamp
    author
    gasUsed
    gasLimit
    size
  }
}`,
  },
  {
    label: "Block by number",
    query: `{
  blocks(where: { number: "1812000" }) {
    number
    timestamp
    parentHash
    author
    difficulty
    gasUsed
    gasLimit
    stateRoot
  }
}`,
  },
  {
    label: "Blocks by miner",
    query: `{
  blocks(
    first: 10
    orderBy: number
    orderDirection: desc
    where: { author: "0x002e555d44cfdb0b919f51b17e75a18a32a6e0dc" }
  ) {
    number
    timestamp
    gasUsed
  }
}`,
  },
  {
    label: "Pagination (skip + first)",
    query: `{
  blocks(first: 5, skip: 10, orderBy: number, orderDirection: desc) {
    number
    timestamp
  }
}`,
  },
  {
    label: "Subgraph metadata (_meta)",
    query: `{
  _meta {
    block { number hash }
    deployment
    hasIndexingErrors
  }
}`,
  },
  {
    label: "Combined: blocks + _meta in one request",
    query: `# GraphQL lets you select multiple top-level fields per query.
# Prefer this over Promise.all([...]) — fewer requests = no rate-limit pain.
{
  blocks(first: 5, orderBy: number, orderDirection: desc) {
    number
    timestamp
    gasUsed
  }
  _meta {
    block { number }
    hasIndexingErrors
  }
}`,
  },
];
