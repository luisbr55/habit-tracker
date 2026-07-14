import type { Habit, HabitCompletion, Category } from "@/db/schema";

/** Hábito con su estado ya resuelto para hoy, listo para renderizar. */
export type HabitWithStatus = Habit & {
  completedToday: boolean;
  streak: number;
  category: Pick<Category, "id" | "name" | "color">;
};

export type { Habit, HabitCompletion, Category };
