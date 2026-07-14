import {
  pgTable,
  uuid,
  text,
  smallint,
  timestamp,
  date,
  integer,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- Auth ----------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // NULL si el usuario solo entra con Google (no tiene password propio)
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  name: text("name"),
  image: text("image"),
  // Sin UI para editarla en v1 — ver technical-spec.md
  timezone: text("timezone").notNull().default("America/Costa_Rica"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    uniqueProviderAccount: uniqueIndex("uq_accounts_provider_account").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

// Tokens de un solo uso: verificación de email y reset de password (mismo patrón)
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(), // email
    token: text("token").notNull(),
    purpose: text("purpose").notNull(), // 'email_verify' | 'password_reset'
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

// ---------- Dominio ----------

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }), // nullable temporalmente — ver "Migración de datos existentes" en technical-spec.md
    name: text("name").notNull(),
    // Hex de la paleta fija — ver sdd/design-system.md → "Paleta de categorías"
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueNamePerUser: uniqueIndex("uq_categories_name_user").on(
      table.userId,
      table.name
    ),
  })
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }), // nullable temporalmente — ver "Migración de datos existentes" en technical-spec.md
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
    // Único constraint parcial: el nombre no se puede repetir entre hábitos activos
    // del mismo usuario, pero sí puede coincidir con uno ya archivado o de otro usuario.
    uniqueActiveNamePerUser: uniqueIndex("uq_habits_name_active_user")
      .on(table.userId, table.name)
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

// ---------- Relaciones ----------

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  habits: many(habits),
  categories: many(categories),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  habits: many(habits),
  user: one(users, { fields: [categories.userId], references: [users.id] }),
}));

export const habitsRelations = relations(habits, ({ many, one }) => ({
  completions: many(habitCompletions),
  category: one(categories, {
    fields: [habits.categoryId],
    references: [categories.id],
  }),
  user: one(users, { fields: [habits.userId], references: [users.id] }),
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

// ---------- Tipos ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;