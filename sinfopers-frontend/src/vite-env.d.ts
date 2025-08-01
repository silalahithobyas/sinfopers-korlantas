/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    // tambahkan env variables lain jika diperlukan
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
