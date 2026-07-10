"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { habitCompletions } from "@/db/schema";
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
