/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_BACKEND_URL: string; 
    VITE_BACKEND_HTTP_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
