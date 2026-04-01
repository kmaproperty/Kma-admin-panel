/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AWS_URL: string
  // add any other VITE_ variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}