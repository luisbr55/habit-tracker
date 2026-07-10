import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  getDay,
  parseISO,
  isBefore,
  isAfter,
  max as maxDate,
  min as minDate,
} from "date-fns";

// Bitmask: Lunes=1, Martes=2, Miércoles=4, Jueves=8, Viernes=16, Sábado=32, Domingo=64.
// date-fns getDay() devuelve 0=domingo..6=sábado, por eso el mapeo.
export const DAY_BITS = {
  lunes: 1,
  martes: 2,
  miercoles: 4,
  jueves: 8,
  viernes: 16,
  sabado: 32,
  domingo: 64,
} as const;

export type DayKey = keyof typeof DAY_BITS;

export const DAY_ORDER: DayKey[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export const DAY_LABELS: Record<DayKey, string> = {
  lunes: "L",
  martes: "M",
  miercoles: "X",
  jueves: "J",
  viernes: "V",
  sabado: "S",
  domingo: "D",
};

/** Convierte el resultado de date-fns getDay() (0=domingo) al bit correspondiente. */
function jsDayToBit(jsDay: number): number {
  const key = DAY_ORDER[(jsDay + 6) % 7]; // corre domingo(0) al final
  return DAY_BITS[key];
}

/** true si `date` es uno de los días programados según el bitmask. */
export function isScheduledDay(date: Date, scheduledDays: number): boolean {
  return (scheduledDays & jsDayToBit(getDay(date))) !== 0;
}

/** Arma el bitmask a partir de una lista de días seleccionados. */
export function daysToMask(days: DayKey[]): number {
  return days.reduce((mask, day) => mask | DAY_BITS[day], 0);
}

/** Devuelve la lista de días (para mostrar en el form de edición) a partir del bitmask. */
export function maskToDays(mask: number): DayKey[] {
  return DAY_ORDER.filter((day) => (mask & DAY_BITS[day]) !== 0);
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Semana ISO actual (lunes a domingo), como array de fechas. */
export function currentWeekDays(referenceDate: Date = new Date()): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/**
 * Días programados de un hábito dentro de la semana actual, acotados a
 * [max(createdAt, inicio de semana), min(hoy, fin de semana)] — no cuenta días
 * futuros ni días previos a la creación del hábito.
 */
export function scheduledDaysInWeek(
  scheduledDaysMask: number,
  createdAt: string | Date,
  referenceDate: Date = new Date()
): Date[] {
  const created =
    typeof createdAt === "string" ? parseISO(createdAt) : createdAt;
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  const rangeStart = maxDate([weekStart, created]);
  const rangeEnd = minDate([weekEnd, referenceDate]);

  if (isAfter(rangeStart, rangeEnd)) return [];

  return eachDayOfInterval({ start: rangeStart, end: rangeEnd }).filter(
    (day) => isScheduledDay(day, scheduledDaysMask) && !isBefore(day, created)
  );
}
