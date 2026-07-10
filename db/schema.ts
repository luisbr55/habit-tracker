import {
  pgTable,
  uuid,
  text,
  smallint,
  timestamp,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Bitmask 0-127. Bit por día: Lunes=1, Martes=2, Miércoles=4, Jueves=8,
    // Viernes=16, Sábado=32, Domingo=64. Ver lib/dateUtils.ts.
    scheduledDays: smallint("scheduled_days").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Soft-delete: un hábito "eliminado" queda con archivedAt seteado, pero su
    // historial de completions se preserva para no invalidar cálculos pasados.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    // Único constraint parcial: el nombre no se puede repetir entre hábitos activos,
    // pero sí puede coincidir con uno ya archivado.
    uniqueActiveName: uniqueIndex("uq_habits_name_active")
      .on(table.name)
      .where(sql`${table.archivedAt} IS NULL`),
  })
);

export const habitCompletions = pgTable(
  "habit_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(), // "YYYY-MM-DD"
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueHabitDate: uniqueIndex("uq_completions_habit_date").on(
      table.habitId,
      table.date
    ),
  })
);

export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
  })
);

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
