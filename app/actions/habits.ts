"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
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

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user.id;
}

export async function addHabit(input: HabitInput): Promise<ActionResult> {
  const userId = await requireUserId();
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
      userId,
      name,
      icon: input.icon || "⭐",
      categoryId: input.categoryId,
      scheduledDays: daysToMask(input.days),
    });
  } catch (err) {
    // El índice único parcial (uq_habits_name_active_user) salta acá si ya existe
    // un hábito activo con el mismo nombre para este usuario.
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
  const userId = await requireUserId();
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
      .where(and(eq(habits.id, input.id), eq(habits.userId, userId)));
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
  const userId = await requireUserId();

  await db
    .update(habits)
    .set({ archivedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)));

  revalidatePath("/");
  revalidatePath("/semana");
  return { ok: true };
}