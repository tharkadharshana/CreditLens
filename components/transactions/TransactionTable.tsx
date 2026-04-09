'use client';

import { Transaction } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { formatLKR } from '@/lib/utils/currency';

interface TransactionTableProps {
  transactions: Transaction[];
  onRowClick?: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  onRowClick,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr className="text-muted-foreground text-xs uppercase">
            <th className="text-left py-3 px-4">Merchant</th>
            <th className="text-left py-3 px-4">Category</th>
            <th className="text-right py-3 px-4">Amount</th>
            <th className="text-right py-3 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(tx)}
            >
              <td className="py-3 px-4 font-medium text-foreground">
                {tx.merchant || tx.description}
              </td>
              <td className="py-3 px-4">
                <CategoryBadge category={tx.category} size="sm" />
              </td>
              <td className="py-3 px-4 text-right text-foreground">
                {formatLKR(tx.amount)}
              </td>
              <td className="py-3 px-4 text-right text-muted-foreground text-xs">
                {new Date(tx.tx_date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
