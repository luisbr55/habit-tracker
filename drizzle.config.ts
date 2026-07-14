import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit no carga .env.local automáticamente (solo .env a secas),
// así que lo cargamos explícito acá.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el entorno (.env.local)");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});