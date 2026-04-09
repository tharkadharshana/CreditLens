'use client';

interface UtilizationBarProps {
  pct: number;
  size?: 'sm' | 'md' | 'lg';
}

export function UtilizationBar({ pct, size = 'md' }: UtilizationBarProps) {
  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getColor = (percent: number) => {
    if (percent > 80) return 'bg-[var(--cl-red)]';
    if (percent > 50) return 'bg-[var(--cl-amber)]';
    return 'bg-[var(--cl-green)]';
  };

  return (
    <div className={`w-full ${heightMap[size]} bg-muted rounded-full overflow-hidden`}>
      <div
        className={`h-full ${getColor(pct)} transition-all duration-300 rounded-full`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      ></div>
    </div>
  );
}
