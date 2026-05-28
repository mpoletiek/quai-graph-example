/// <reference types="vite/client" />

declare module "*?raw" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_GRAPH_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
