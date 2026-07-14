"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { ActionResult } from "./habits";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user.id;
}

export async function listCategories() {
  const userId = await requireUserId();
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name));
}

export async function addCategory(input: {
  name: string;
  color: string;
}): Promise<ActionResult & { id?: string }> {
  const userId = await requireUserId();
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre de la categoría no puede estar vacío." };
  }

  try {
    const [created] = await db
      .insert(categories)
      .values({ userId, name, color: input.color })
      .returning({ id: categories.id });

    revalidatePath("/");
    revalidatePath("/semana");
    return { ok: true, id: created.id };
  } catch (err) {
    return { ok: false, error: "Ya existe una categoría con ese nombre." };
  }
}