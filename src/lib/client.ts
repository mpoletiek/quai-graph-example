import { GraphQLClient } from "graphql-request";

export const GRAPH_URL =
  import.meta.env.VITE_GRAPH_URL ??
  "https://graph.quai.network/subgraphs/name/quai-blocks";

export const client = new GraphQLClient(GRAPH_URL);

export async function runQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  return client.request<T>({ document: query, variables, signal });
}
