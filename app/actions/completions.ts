"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { habitCompletions, habits } from "@/db/schema";
import type { ActionResult } from "./habits";

/**
 * Marca o desmarca un hábito como completado en `date` (YYYY-MM-DD).
 * Es la única mutación que se llama desde el checkbox de "Hoy", por eso
 * revalida ambas vistas (racha y % semanal dependen de esto).
 */
export async function toggleCompletion(
  habitId: string,
  date: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  // Verificamos que el hábito sea del usuario logueado antes de tocar nada —
  // sin esto, cualquiera podría togglear completions de hábitos ajenos con solo
  // adivinar el id.
  const [owned] = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
    .limit(1);

  if (!owned) {
    return { ok: false, error: "No tenés permiso sobre este hábito." };
  }

  const existing = await db
    .select({ id: habitCompletions.id })
    .from(habitCompletions)
    .where(
      and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, date))
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(habitCompletions)
      .where(eq(habitCompletions.id, existing[0].id));
  } else {
    await db.insert(habitCompletions).values({ habitId, date });
  }

  revalidatePath("/");
  revalidatePath("/semana");
  return { ok: true };
}