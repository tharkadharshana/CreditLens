'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  meta?: string;
  color: 'green' | 'red' | 'blue' | 'amber';
}

const colorMap = {
  green: 'text-[var(--cl-green)]',
  red: 'text-[var(--cl-red)]',
  blue: 'text-[var(--cl-blue)]',
  amber: 'text-[var(--cl-amber)]',
};

export function StatCard({ label, value, meta, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]} mt-2`}>{value}</p>
      {meta && <p className="text-muted-foreground text-xs mt-2">{meta}</p>}
    </div>
  );
}
