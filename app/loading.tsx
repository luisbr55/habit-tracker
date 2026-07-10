export default function Loading() {
  return (
    <main>
      <div className="mb-6 h-10 animate-pulse rounded-control bg-surface" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-card border border-border bg-surface"
          />
        ))}
      </div>
    </main>
  );
}
