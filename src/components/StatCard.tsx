"use client";

export function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center transition-all hover:bg-card-hover">
      <div
        className="text-3xl font-bold font-mono"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
