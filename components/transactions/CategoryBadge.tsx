'use client';

import { CATEGORY_CONFIG } from '@/lib/utils/categories';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  const bgColor = config?.color || '#9090a8';

  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-full text-white font-medium inline-flex items-center gap-1`}
      style={{ backgroundColor: bgColor }}
    >
      <span>{config?.emoji || '📌'}</span>
      {config?.label || category}
    </div>
  );
}
