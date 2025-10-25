/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGINGFACE_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
