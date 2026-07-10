"use client";

import { useState } from "react";
import { HabitCard } from "./HabitCard";
import { EmptyState } from "./EmptyState";
import { HabitFormModal } from "./HabitFormModal";
import { maskToDays, type DayKey } from "@/lib/dateUtils";
import type { HabitWithStatus } from "@/lib/types";

export function HabitList({
  habits,
  today,
}: {
  habits: HabitWithStatus[];
  today: string;
}) {
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    days: DayKey[];
  } | null>(null);

  if (habits.length === 0) {
    return (
      <EmptyState
        title="No tenés hábitos programados para hoy."
        description="Revisá tus hábitos o agregá uno nuevo desde el botón de abajo."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habitId={habit.id}
            name={habit.name}
            streak={habit.streak}
            completedToday={habit.completedToday}
            streakActive={habit.completedToday}
            date={today}
            onEdit={() =>
              setEditing({
                id: habit.id,
                name: habit.name,
                days: maskToDays(habit.scheduledDays),
              })
            }
          />
        ))}
      </div>

      <HabitFormModal
        key={editing?.id ?? "new"}
        open={editing !== null}
        onClose={() => setEditing(null)}
        editing={editing}
      />
    </>
  );
}
