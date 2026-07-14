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

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Hex de la paleta fija — ver sdd/design-system.md → "Paleta de categorías"
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueName: uniqueIndex("uq_categories_name").on(table.name),
  })
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("⭐"), // emoji libre elegido por el usuario
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
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

export const categoriesRelations = relations(categories, ({ many }) => ({
  habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ many, one }) => ({
  completions: many(habitCompletions),
  category: one(categories, {
    fields: [habits.categoryId],
    references: [categories.id],
  }),
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

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;