import { and, isNull, inArray, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { habits, habitCompletions, categories } from "@/db/schema";
import { isScheduledDay, todayISO } from "@/lib/dateUtils";
import { calculateStreak } from "@/lib/streaks";
import { NavTabs } from "@/components/NavTabs";
import { HabitList } from "@/components/HabitList";
import { AddHabitButton } from "@/components/AddHabitButton";
import { EmptyState } from "@/components/EmptyState";
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner";
import type { HabitWithStatus } from "@/lib/types";

export default async function TodayPage() {
  const session = await auth();
  const userId = session!.user.id; // el middleware ya garantiza que hay sesión

  const today = new Date();
  const todayStr = todayISO();

  const activeHabits = await db
    .select({
      id: habits.id,
      userId: habits.userId,
      name: habits.name,
      icon: habits.icon,
      categoryId: habits.categoryId,
      scheduledDays: habits.scheduledDays,
      createdAt: habits.createdAt,
      archivedAt: habits.archivedAt,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
      },
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id))
    .where(and(eq(habits.userId, userId), isNull(habits.archivedAt)));

  const banner = !session!.user.emailVerified ? <VerifyEmailBanner /> : null;

  if (activeHabits.length === 0) {
    return (
      <main>
        {banner}
        <NavTabs />
        <EmptyState
          title="Todavía no tenés hábitos."
          description="Agregá el primero desde el botón de abajo."
        />
        <AddHabitButton />
      </main>
    );
  }

  const habitsToday = activeHabits.filter((h) =>
    isScheduledDay(today, h.scheduledDays)
  );

  const allCompletions =
    habitsToday.length > 0
      ? await db
          .select()
          .from(habitCompletions)
          .where(
            inArray(
              habitCompletions.habitId,
              habitsToday.map((h) => h.id)
            )
          )
      : [];

  const completionsByHabit = new Map<string, typeof allCompletions>();
  for (const c of allCompletions) {
    const list = completionsByHabit.get(c.habitId) ?? [];
    list.push(c);
    completionsByHabit.set(c.habitId, list);
  }

  const habitsWithStatus: HabitWithStatus[] = habitsToday.map((h) => {
    const completions = completionsByHabit.get(h.id) ?? [];
    return {
      ...h,
      completedToday: completions.some((c) => c.date === todayStr),
      streak: calculateStreak(h, completions, today),
    };
  });

  return (
    <main>
      {banner}
      <NavTabs />
      <HabitList habits={habitsWithStatus} today={todayStr} />
      <AddHabitButton />
    </main>
  );
}