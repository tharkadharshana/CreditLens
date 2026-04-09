'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Budget } from '@/types';

interface UseBudgetsResult {
  budgets: Budget[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBudgets(): UseBudgetsResult {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(new Error('Not authenticated'));
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      setBudgets(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch budgets'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return { budgets, loading, error, refetch: fetchBudgets };
}
