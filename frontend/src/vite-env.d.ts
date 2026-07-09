/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ARENA_WS_URL: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.glb' {
  const content: string
  export default content
}

declare global {
  interface Window {
    SENTRY_DSN: string
    colonyEnter: (colony: Colony) => void
  }
}
