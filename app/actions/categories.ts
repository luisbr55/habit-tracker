"use server";

import { revalidatePath } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { ActionResult } from "./habits";

export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function addCategory(input: {
  name: string;
  color: string;
}): Promise<ActionResult & { id?: string }> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre de la categoría no puede estar vacío." };
  }

  try {
    const [created] = await db
      .insert(categories)
      .values({ name, color: input.color })
      .returning({ id: categories.id });

    revalidatePath("/");
    revalidatePath("/semana");
    return { ok: true, id: created.id };
  } catch (err) {
    return { ok: false, error: "Ya existe una categoría con ese nombre." };
  }
}
