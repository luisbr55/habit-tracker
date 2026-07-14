import { scheduledDaysInWeek, toISODate } from "./dateUtils";
import { calculateLongestStreak } from "./streaks";
import type { Habit, HabitCompletion } from "@/db/schema";

export type HabitWeeklyStat = {
  habitId: string;
  name: string;
  icon: string;
  categoryColor: string;
  scheduledCount: number;
  completedCount: number;
  /** null cuando scheduledCount es 0 → todavía no transcurrió ningún día programado */
  percentage: number | null;
  longestStreak: number;
};

export type WeeklyStats = {
  perHabit: HabitWeeklyStat[];
  overall: {
    scheduledCount: number;
    completedCount: number;
    percentage: number | null;
  };
};

/**
 * Calcula el % de cumplimiento semanal por hábito y general, para la semana
 * (lunes a domingo) que contiene `referenceDate`. Ver reglas en
 * sdd/spec-habitos/technical-spec.md → "Cálculo de % semanal".
 */
export function calculateWeeklyStats(
  habits: Pick<
    Habit,
    "id" | "name" | "icon" | "scheduledDays" | "createdAt"
  >[],
  completionsByHabit: Map<string, Pick<HabitCompletion, "date">[]>,
  categoryColorByHabit: Map<string, string>,
  referenceDate: Date = new Date()
): WeeklyStats {
  let totalScheduled = 0;
  let totalCompleted = 0;

  const perHabit: HabitWeeklyStat[] = habits.map((habit) => {
    const scheduledDays = scheduledDaysInWeek(
      habit.scheduledDays,
      habit.createdAt,
      referenceDate
    );
    const completions = completionsByHabit.get(habit.id) ?? [];
    const completedDates = new Set(completions.map((c) => c.date));

    const scheduledCount = scheduledDays.length;
    const completedCount = scheduledDays.filter((d) =>
      completedDates.has(toISODate(d))
    ).length;

    totalScheduled += scheduledCount;
    totalCompleted += completedCount;

    return {
      habitId: habit.id,
      name: habit.name,
      icon: habit.icon,
      categoryColor: categoryColorByHabit.get(habit.id) ?? "#78716C",
      scheduledCount,
      completedCount,
      percentage: scheduledCount === 0 ? null : completedCount / scheduledCount,
      longestStreak: calculateLongestStreak(habit, completions, referenceDate),
    };
  });

  return {
    perHabit,
    overall: {
      scheduledCount: totalScheduled,
      completedCount: totalCompleted,
      percentage: totalScheduled === 0 ? null : totalCompleted / totalScheduled,
    },
  };
}
