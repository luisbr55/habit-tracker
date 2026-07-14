"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { daysToMask, type DayKey } from "@/lib/dateUtils";

export type ActionResult = { ok: true } | { ok: false; error: string };

type HabitInput = {
  name: string;
  days: DayKey[];
  icon: string;
  categoryId: string;
};

export async function addHabit(input: HabitInput): Promise<ActionResult> {
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "El nombre no puede estar vacío." };
  }
  if (input.days.length === 0) {
    return { ok: false, error: "Elegí al menos un día de la semana." };
  }
  if (!input.categoryId) {
    return { ok: false, error: "Elegí o creá una categoría." };
  }

  try {
    await db.insert(habits).values({
      name,
      icon: input.icon || "⭐",
      categoryId: input.categoryId,
      scheduledDays: daysToMask(input.days),
    });
  } catch (err) {
    // El índice único parcial (uq_habits_name_active) salta acá si ya existe
    // un hábito activo con el mismo nombre.
    return {
      ok: false,
      error: "Ya existe un hábito activo con ese nombre.",
    };
  }

  revalidatePath("/");
  revalidatePath("/semana");
  return { ok: true };
}

export async function editHabit(
  input: HabitInput & { id: string }
): Promise<ActionResult> {
  const name = input.name.trim();

  if (!name) {
    return { ok: false, error: "El nombre no puede estar vacío." };
  }
  if (input.days.length === 0) {
    return { ok: false, error: "Elegí al menos un día de la semana." };
  }
  if (!input.categoryId) {
    return { ok: false, error: "Elegí o creá una categoría." };
  }

  try {
    await db
      .update(habits)
      .set({
        name,
        icon: input.icon || "⭐",
        categoryId: input.categoryId,
        scheduledDays: daysToMask(input.days),
      })
      .where(eq(habits.id, input.id));
  } catch (err) {
    return {
      ok: false,
      error: "Ya existe un hábito activo con ese nombre.",
    };
  }

  revalidatePath("/");
  revalidatePath("/semana");
  return { ok: true };
}

/** Soft-delete: preserva el historial de completions (ver technical-spec.md). */
export async function archiveHabit(id: string): Promise<ActionResult> {
  await db
    .update(habits)
    .set({ archivedAt: new Date() })
    .where(eq(habits.id, id));

  revalidatePath("/");
  revalidatePath("/semana");
  return { ok: true };
}
