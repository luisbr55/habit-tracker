export function WeeklyOverallProgress({
  percentage,
}: {
  percentage: number | null;
}) {
  const label = percentage === null ? "—" : `${Math.round(percentage * 100)}%`;
  const widthPct = percentage === null ? 0 : Math.round(percentage * 100);

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-text-muted">Cumplimiento de la semana</span>
        <span className="text-lg font-semibold text-text">{label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-border">
        <div
          className="h-2 rounded-full bg-accent transition-all duration-300"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
