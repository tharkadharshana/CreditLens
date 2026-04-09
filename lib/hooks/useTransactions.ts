'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Transaction } from '@/types';

interface UseTransactionsOptions {
  cardId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refetch: () => Promise<void>;
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(new Error('Not authenticated'));
        return;
      }

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (options.cardId) {
        query = query.eq('card_id', options.cardId);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      query = query.order('tx_date', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setTransactions(data || []);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  }, [supabase, options.cardId, options.category, options.limit, options.offset]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, totalCount, refetch: fetchTransactions };
}
