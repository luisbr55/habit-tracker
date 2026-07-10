# Habit Tracker

App personal para cargar hábitos diarios, marcarlos como completados, y ver racha
actual + métricas semanales. Specs completos en `sdd/`.

## Stack
Next.js (App Router) · TypeScript · Tailwind · Drizzle ORM · Neon (Postgres) · Vercel

## Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar la base de datos:
   ```bash
   cp .env.local.example .env.local
   ```
   Editá `.env.local` y pegá ahí tu connection string real de Neon en `DATABASE_URL`.
   **Nunca compartas ese valor fuera de este archivo** (no lo pegues en chats, commits,
   ni lo subas a git — `.env.local` ya está en `.gitignore`).

3. Generar y aplicar las migraciones (crea las tablas `habits` y `habit_completions`
   en tu base de Neon):
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Correr en desarrollo:
   ```bash
   npm run dev
   ```
   Abrir http://localhost:3000

## Deploy a Vercel
1. Subí el repo a GitHub/GitLab.
2. Importá el proyecto en Vercel.
3. Agregá `DATABASE_URL` como variable de entorno en la configuración del proyecto en
   Vercel (Settings → Environment Variables) — no en el código.
4. Deploy.

## Estructura
Ver `sdd/spec-habitos/technical-spec.md` para el detalle completo de arquitectura,
modelo de datos y decisiones de diseño.
