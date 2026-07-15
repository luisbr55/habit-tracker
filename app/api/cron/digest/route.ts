import { NextResponse } from "next/server";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, habits, habitCompletions } from "@/db/schema";
import { isScheduledDay, todayISO } from "@/lib/dateUtils";
import { sendDigestEmail } from "@/lib/email";

// Corre una vez al día vía Vercel Cron (ver vercel.json). No requiere sesión de
// usuario — se protege con CRON_SECRET, que Vercel manda automáticamente en el
// header Authorization cuando la variable de entorno está configurada.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStr = todayISO();

  const allUsers = await db.select().from(users);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of allUsers) {
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), isNull(habits.archivedAt)));

    const habitsToday = userHabits.filter((h) =>
      isScheduledDay(today, h.scheduledDays)
    );

    // Sin nada programado hoy → no molestamos con un email vacío.
    if (habitsToday.length === 0) {
      skipped++;
      continue;
    }

    const completions = await db
      .select()
      .from(habitCompletions)
      .where(
        inArray(
          habitCompletions.habitId,
          habitsToday.map((h) => h.id)
        )
      );

    const completedIds = new Set(
      completions.filter((c) => c.date === todayStr).map((c) => c.habitId)
    );

    const missing = habitsToday.filter((h) => !completedIds.has(h.id));

    try {
      await sendDigestEmail(user.email, {
        missingHabitNames: missing.map((h) => h.name),
        allDone: missing.length === 0,
      });
      sent++;
    } catch (err) {
      // Una falla puntual no corta el resto del batch.
      console.error(`No se pudo enviar el digest a ${user.email}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}