import { subDays, parseISO, isBefore } from "date-fns";
import { isScheduledDay, toISODate } from "./dateUtils";
import type { Habit, HabitCompletion } from "@/db/schema";

/**
 * Calcula la racha actual de un hábito: cantidad de días programados
 * consecutivos cumplidos, contando hacia atrás desde el último día programado
 * ≤ hoy. Si falta un día programado (sin completion), la racha se corta ahí
 * — no hay margen/perdón (regla acordada en sdd/spec-habitos/technical-spec.md).
 */
export function calculateStreak(
  habit: Pick<Habit, "scheduledDays" | "createdAt">,
  completions: Pick<HabitCompletion, "date">[],
  referenceDate: Date = new Date()
): number {
  const completedDates = new Set(completions.map((c) => c.date));
  const createdAt =
    typeof habit.createdAt === "string"
      ? parseISO(habit.createdAt)
      : habit.createdAt;

  let streak = 0;
  let cursor = new Date(referenceDate);
  // Tope de seguridad para no iterar indefinidamente si algo está mal armado.
  const MAX_ITERATIONS = 3650; // ~10 años
  let iterations = 0;

  while (!isBefore(cursor, createdAt) && iterations < MAX_ITERATIONS) {
    iterations++;
    if (isScheduledDay(cursor, habit.scheduledDays)) {
      if (completedDates.has(toISODate(cursor))) {
        streak++;
      } else {
        break; // día programado sin completar → corta la racha acá
      }
    }
    cursor = subDays(cursor, 1);
  }

  return streak;
}

/** true si el hábito está "activo hoy": el último día programado fue cumplido. */
export function isStreakActiveToday(
  habit: Pick<Habit, "scheduledDays" | "createdAt">,
  completions: Pick<HabitCompletion, "date">[],
  referenceDate: Date = new Date()
): boolean {
  if (!isScheduledDay(referenceDate, habit.scheduledDays)) {
    // Si hoy no es día programado, se considera "activa" si la racha > 0
    // (no se rompió, simplemente hoy no corresponde marcar nada).
    return calculateStreak(habit, completions, referenceDate) > 0;
  }
  return completions.some((c) => c.date === toISODate(referenceDate));
}

/**
 * Racha más larga histórica: recorre todo el historial de días programados
 * desde `createdAt` hasta `referenceDate`, y devuelve el mayor tramo consecutivo
 * de días programados cumplidos que se haya dado alguna vez (no solo el vigente).
 * Misma regla de corte que calculateStreak (sin margen), pero sin detenerse en el
 * primer corte — sigue para encontrar el máximo.
 */
export function calculateLongestStreak(
  habit: Pick<Habit, "scheduledDays" | "createdAt">,
  completions: Pick<HabitCompletion, "date">[],
  referenceDate: Date = new Date()
): number {
  const completedDates = new Set(completions.map((c) => c.date));
  const createdAt =
    typeof habit.createdAt === "string"
      ? parseISO(habit.createdAt)
      : habit.createdAt;

  let longest = 0;
  let current = 0;
  let cursor = new Date(referenceDate);
  const MAX_ITERATIONS = 3650;
  let iterations = 0;

  while (!isBefore(cursor, createdAt) && iterations < MAX_ITERATIONS) {
    iterations++;
    if (isScheduledDay(cursor, habit.scheduledDays)) {
      if (completedDates.has(toISODate(cursor))) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    cursor = subDays(cursor, 1);
  }

  return longest;
}
