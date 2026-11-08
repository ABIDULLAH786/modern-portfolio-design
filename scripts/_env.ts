import { loadEnvConfig } from "@next/env";

/** Load .env / .env.local the same way Next.js does. */
loadEnvConfig(process.cwd());
