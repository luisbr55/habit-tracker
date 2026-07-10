import type { Habit, HabitCompletion } from "@/db/schema";

/** Hábito con su estado ya resuelto para hoy, listo para renderizar. */
export type HabitWithStatus = Habit & {
  completedToday: boolean;
  streak: number;
};

export type { Habit, HabitCompletion };
