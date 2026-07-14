import { isNull, inArray, eq } from "drizzle-orm";
import { db } from "@/db";
import { habits, habitCompletions, categories } from "@/db/schema";
import { calculateWeeklyStats } from "@/lib/weeklyStats";
import { NavTabs } from "@/components/NavTabs";
import { WeeklyOverallProgress } from "@/components/WeeklyOverallProgress";
import { HabitWeeklyRow } from "@/components/HabitWeeklyRow";
import { EmptyState } from "@/components/EmptyState";
import { AddHabitButton } from "@/components/AddHabitButton";

export default async function WeekPage() {
  const activeHabits = await db
    .select({
      id: habits.id,
      name: habits.name,
      icon: habits.icon,
      categoryId: habits.categoryId,
      scheduledDays: habits.scheduledDays,
      createdAt: habits.createdAt,
      archivedAt: habits.archivedAt,
      categoryColor: categories.color,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id))
    .where(isNull(habits.archivedAt));

  if (activeHabits.length === 0) {
    return (
      <main>
        <NavTabs />
        <EmptyState
          title="Todavía no tenés hábitos."
          description="Agregá el primero desde el botón de abajo."
        />
        <AddHabitButton />
      </main>
    );
  }

  const allCompletions = await db
    .select()
    .from(habitCompletions)
    .where(
      inArray(
        habitCompletions.habitId,
        activeHabits.map((h) => h.id)
      )
    );

  const completionsByHabit = new Map<string, typeof allCompletions>();
  for (const c of allCompletions) {
    const list = completionsByHabit.get(c.habitId) ?? [];
    list.push(c);
    completionsByHabit.set(c.habitId, list);
  }

  const categoryColorByHabit = new Map<string, string>(
    activeHabits.map((h) => [h.id, h.categoryColor])
  );

  const stats = calculateWeeklyStats(
    activeHabits,
    completionsByHabit,
    categoryColorByHabit
  );

  return (
    <main>
      <NavTabs />
      <div className="flex flex-col gap-4">
        <WeeklyOverallProgress percentage={stats.overall.percentage} />
        <div className="flex flex-col gap-3">
          {stats.perHabit.map((stat) => (
            <HabitWeeklyRow key={stat.habitId} stat={stat} />
          ))}
        </div>
      </div>
      <AddHabitButton />
    </main>
  );
}