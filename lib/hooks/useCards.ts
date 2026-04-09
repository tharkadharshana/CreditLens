'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard } from '@/types';

interface UseCardsResult {
  cards: CreditCard[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCards(): UseCardsResult {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError(new Error('Not authenticated'));
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Enrich cards with computed fields
      const enrichedCards = (data || []).map((card: CreditCard) => ({
        ...card,
        available_credit: card.credit_limit - card.current_balance,
        utilization_pct: Math.round((card.current_balance / card.credit_limit) * 100),
      }));

      setCards(enrichedCards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCards();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`credit_cards_user`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_cards',
          filter: `user_id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`,
        },
        () => {
          fetchCards();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCards, supabase]);

  return { cards, loading, error, refetch: fetchCards };
}
