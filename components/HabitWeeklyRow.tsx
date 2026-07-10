import type { HabitWeeklyStat } from "@/lib/weeklyStats";

export function HabitWeeklyRow({ stat }: { stat: HabitWeeklyStat }) {
  const label =
    stat.percentage === null ? "—" : `${Math.round(stat.percentage * 100)}%`;
  const widthPct =
    stat.percentage === null ? 0 : Math.round(stat.percentage * 100);

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-base text-text">{stat.name}</span>
        <span className="text-sm font-semibold text-text">
          {label}
          <span className="ml-1 font-normal text-text-muted">
            ({stat.completedCount}/{stat.scheduledCount})
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-accent transition-all duration-300"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
