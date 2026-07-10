"use client";

import { useOptimistic, useTransition } from "react";
import { toggleCompletion } from "@/app/actions/completions";

export function HabitCard({
  habitId,
  name,
  streak,
  completedToday,
  streakActive,
  date,
  onEdit,
}: {
  habitId: string;
  name: string;
  streak: number;
  completedToday: boolean;
  streakActive: boolean;
  date: string; // YYYY-MM-DD de hoy
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completedToday
  );

  function handleToggle() {
    startTransition(async () => {
      setOptimisticCompleted(!optimisticCompleted);
      await toggleCompletion(habitId, date);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={optimisticCompleted}
          aria-label={
            optimisticCompleted
              ? `Marcar "${name}" como no completado`
              : `Marcar "${name}" como completado`
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
            optimisticCompleted
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface"
          } ${isPending ? "opacity-70" : ""}`}
        >
          {optimisticCompleted && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <span className="text-base text-text">{name}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-lg font-semibold text-text">
          <span
            className={streakActive && streak > 0 ? "text-accent" : "text-text"}
          >
            {streak}
          </span>
          <span className="text-xs font-normal text-text-muted">
            {streak === 1 ? "día" : "días"}
          </span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar "${name}"`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-border/50"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
