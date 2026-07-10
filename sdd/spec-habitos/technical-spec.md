# Spec Técnico — Habit Tracker

## Stack

| Capa         | Elección                                    |
|--------------|-----------------------------------------------|
| Framework    | Next.js (App Router)                          |
| Lenguaje     | TypeScript                                    |
| Estilos      | Tailwind CSS, usando los tokens de `sdd/design-system.md` |
| ORM          | Drizzle                                       |
| Base de datos| Neon (Postgres serverless)                    |
| Storage de imágenes | Vercel Blob (no se usa en v1 — no hay imágenes en el alcance funcional actual; se deja definido para cuando se agreguen íconos/fotos de hábito) |
| Deploy       | Vercel                                        |

No hay autenticación en v1 (uso personal, un solo usuario implícito). Todos los datos
viven en una base compartida sin `user_id`, ya que no hay login. Si más adelante se
agrega multiusuario, va a requerir agregar auth (ej. Auth.js) y una columna `user_id`
en ambas tablas — está anotado en Decisiones.

## Modelo de datos (Drizzle / Postgres)

```sql
CREATE TABLE habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  scheduled_days  SMALLINT NOT NULL,       -- bitmask 0-127, bit por día (L=1, M=2, ... D=64)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at     TIMESTAMPTZ NULL,        -- soft-delete al "eliminar" un hábito
  UNIQUE (name)                            -- evita duplicados exactos (solo entre no archivados, ver nota)
);

CREATE TABLE habit_completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id      UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date          DATE NOT NULL,             -- día que se completó
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)                  -- no se puede completar dos veces el mismo día
);

CREATE INDEX idx_completions_habit_date ON habit_completions (habit_id, date);
```

Nota sobre el `UNIQUE (name)`: Postgres no permite condicionar un UNIQUE constraint a
`archived_at IS NULL` sin un índice parcial. Se implementa como índice único parcial:

```sql
CREATE UNIQUE INDEX uq_habits_name_active ON habits (name) WHERE archived_at IS NULL;
```
(y se quita el `UNIQUE (name)` inline de la tabla).

Drizzle schema (`src/db/schema.ts`) refleja esto 1:1 con `pgTable`, `uuid`, `smallint`,
`timestamp`, `date`, y el índice parcial vía `uniqueIndex(...).where(...)`.

## Arquitectura

Next.js App Router, Server Components para lectura + Server Actions para mutaciones
(no hace falta una capa de API routes separada para este alcance).

```
app/
  page.tsx                  -- vista "Hoy" (Server Component, lee habits+completions de hoy)
  semana/
    page.tsx                -- vista "Semana" (Server Component, lee stats semanales)
  actions/
    habits.ts               -- server actions: addHabit, editHabit, archiveHabit
    completions.ts           -- server action: toggleCompletion(habitId, date)
components/
  HabitList.tsx
  HabitCard.tsx              -- Client Component (necesita interactividad del checkbox)
  HabitFormModal.tsx          -- Client Component
  WeeklyOverallProgress.tsx
  HabitWeeklyRow.tsx
  EmptyState.tsx
lib/
  streaks.ts                 -- cálculo de racha (función pura, recibe datos ya traídos de la DB)
  weeklyStats.ts               -- cálculo de % semanales (función pura)
  dateUtils.ts                 -- bitmask de días, semana ISO, helpers date-fns
db/
  schema.ts                   -- tablas Drizzle
  index.ts                     -- cliente Drizzle + conexión a Neon
```

Toda la lógica de cálculo (racha, % semanal) sigue viviendo en funciones puras
(`lib/streaks.ts`, `lib/weeklyStats.ts`) que reciben arrays de `habits` +
`completions` ya consultados de la base, y devuelven números — testeables sin DB.

### Cálculo de racha
Por cada hábito, contando hacia atrás desde el último día programado ≤ hoy:
1. Si ese día programado no tiene completion → racha = 0.
2. Si la tiene → racha += 1, seguir con el día programado anterior.
3. Repetir hasta encontrar un día programado sin completion o hasta `created_at`.

Falta un día programado → racha vuelve a 0 (sin margen/perdón).

### Cálculo de % semanal
Semana = lunes a domingo (ISO week), con `date-fns` (`startOfWeek`/`endOfWeek`,
`weekStartsOn: 1`).
- Días programados de la semana = días que matchean `scheduled_days`, intersectados
  con `[max(created_at, inicio de semana), min(hoy, fin de semana)]`.
- % por hábito = completions en esa semana / días programados de esa semana.
- % general = suma de completions de todos los hábitos / suma de días programados de
  todos los hábitos, en la semana.
- Si días programados de la semana = 0 (aún no transcurrió ninguno) → mostrar "—" en
  vez de dividir por cero.

## Layout responsive

La app es mobile-first pero se consume vía navegador (no PWA/nativa en v1). El layout
se resuelve con un único contenedor centrado, sin breakpoints que reordenen componentes:

- Ancho máximo del contenido: `max-w-md` (28rem / 448px de Tailwind) — equivalente al
  ancho cómodo de un teléfono. Se puede ajustar el token si en la implementación se ve
  muy angosto/ancho, pero se arranca con este valor.
- En mobile (viewport < 448px): el contenedor ocupa el 100% del ancho con padding
  horizontal (`px-4`).
- En tablet/desktop (viewport ≥ 448px): el contenedor se centra (`mx-auto`) con el
  `max-w-md`, y el resto del viewport queda con el `background` del design system (sin
  contenido, actúa como "marco").
- Se implementa una sola vez en el layout raíz (`app/layout.tsx`), envolviendo todas
  las páginas — ninguna página individual necesita repetir esta lógica.
- No hay una versión de escritorio con más columnas o distinto aprovechamiento del
  espacio: es intencional, para no duplicar diseño ni lógica de layout por breakpoint.

## Variables de entorno

| Variable                | Uso                                              |
|--------------------------|---------------------------------------------------|
| `DATABASE_URL`            | Connection string de Neon (usado por Drizzle)      |
| `BLOB_READ_WRITE_TOKEN`   | Solo si se activa Vercel Blob a futuro (no usado en v1) |

## Decisiones y alternativas descartadas
- **Neon + Drizzle vs. localStorage**: se descarta la propuesta inicial de localStorage
  (spec anterior) a pedido explícito — se prioriza persistencia real y portabilidad
  (Vercel deploy, posible acceso desde más de un dispositivo/navegador en el futuro,
  aunque sin login todavía) por sobre la simplicidad de cero-backend.
- **Sin autenticación en v1 pese a tener base real**: se mantiene 1 usuario implícito
  sin `user_id` para no anticipar complejidad de auth que no fue pedida. Migrar a
  multiusuario después implica: agregar tabla `users`, columna `user_id` en `habits`,
  y filtrar todas las queries — no es un cambio menor, queda documentado como riesgo
  conocido si se pide más adelante.
- **Server Actions vs. API routes**: se eligen Server Actions porque simplifican el
  flujo de mutaciones en Next.js App Router sin necesitar endpoints REST separados,
  y siguen habilitando optimistic UI en el cliente con `useOptimistic`.
- **Racha sin margen/perdón**: igual que en la versión anterior del spec — se mantiene
  simple y predecible en v1.
- **Vercel Blob incluido pero no usado**: se deja definido en el stack porque el
  usuario lo pidió "si aplica", pero no hay ninguna funcionalidad de imágenes en el
  alcance funcional actual (ver `functional-spec.md`). No se crea infraestructura para
  algo que no se va a usar todavía.

## UI interaction model
- **Optimistic UI**: `toggleCompletion` se dispara con `useOptimistic` — el checkbox y
  la racha se actualizan en el cliente antes de que la Server Action confirme contra
  Neon. Si falla, se revierte el estado optimista y se muestra un error breve.
- **Navegación instantánea**: los links entre "Hoy" y "Semana" usan el router de
  Next.js (prefetch automático); no se espera a que termine de cargar la data para
  iniciar la transición de ruta.
- **Skeleton loaders**: cada `page.tsx` que lee de Neon define su `loading.tsx`
  correspondiente (Next.js loading UI) con el layout de la lista/cards en gris, para
  cubrir la latencia de la query a la base.
- **Feedback de botones**: el botón "Guardar" del formulario de hábito usa
  `useFormStatus`/estado de la Server Action para mostrar pending (spinner) → success
  (check) → error (estilo destructivo) según corresponda.
- **Client-side first**: los Client Components (`HabitCard`, checkbox) disparan la
  Server Action con `startTransition` para no bloquear la interacción del usuario
  mientras se confirma en el servidor.
