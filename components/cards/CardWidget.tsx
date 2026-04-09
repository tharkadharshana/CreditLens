'use client';

import { CreditCard } from '@/types';

interface CardWidgetProps {
  card: CreditCard;
}

export function CardWidget({ card }: CardWidgetProps) {
  const bgColor = card.card_color || '#7c6cfa';

  return (
    <div
      className="rounded-2xl p-6 text-white shadow-lg aspect-video flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
      }}
    >
      {/* Top: Card Network and Emoji */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{card.bank_name}</div>
        <div className="text-3xl">{card.card_emoji || '💳'}</div>
      </div>

      {/* Middle: Chip */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-8 bg-yellow-400 rounded opacity-20"></div>
      </div>

      {/* Bottom: Card Details */}
      <div className="space-y-2">
        <p className="text-xs opacity-75">{card.card_name}</p>
        <div className="flex items-center justify-between">
          <div className="text-lg font-mono tracking-widest">
            •••• {card.last_four}
          </div>
        </div>
      </div>
    </div>
  );
}
