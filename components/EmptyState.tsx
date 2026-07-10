export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-surface px-6 py-12 text-center">
      <p className="text-base text-text">{title}</p>
      <p className="text-sm text-text-muted">{description}</p>
    </div>
  );
}
