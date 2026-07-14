import type { HabitWeeklyStat } from "@/lib/weeklyStats";

export function HabitWeeklyRow({ stat }: { stat: HabitWeeklyStat }) {
  const label =
    stat.percentage === null ? "—" : `${Math.round(stat.percentage * 100)}%`;
  const widthPct =
    stat.percentage === null ? 0 : Math.round(stat.percentage * 100);

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
            style={{ backgroundColor: `${stat.categoryColor}1A` }}
            aria-hidden="true"
          >
            {stat.icon}
          </span>
          <span className="text-base text-text">{stat.name}</span>
        </div>
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
      <p className="mt-2 text-xs text-text-muted">
        🏆 Mejor racha: {stat.longestStreak} {stat.longestStreak === 1 ? "día" : "días"}
      </p>
    </div>
  );
}
