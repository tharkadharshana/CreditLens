import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { inferCategory } from '@/lib/utils/categories';

interface IngestPayload {
  api_key: string;
  card_id: string;
  amount: number;
  description: string;
  merchant?: string;
  category?: string;
  tx_type?: 'debit' | 'credit' | 'refund' | 'fee' | 'interest';
  tx_date?: string;
  raw_message?: string;
  currency?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: IngestPayload = await request.json();

    // Validate required fields
    if (!payload.api_key || !payload.card_id || !payload.amount || !payload.description) {
      return NextResponse.json(
        { error: 'Missing required fields: api_key, card_id, amount, description' },
        { status: 400 }
      );
    }

    // Verify API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('api_key', payload.api_key)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Verify card belongs to user
    const { data: card } = await supabase
      .from('credit_cards')
      .select('id, user_id, current_balance, credit_limit, due_day')
      .eq('id', payload.card_id)
      .eq('user_id', profile.user_id)
      .single();

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Infer category if not provided
    const category = payload.category || inferCategory(payload.description, payload.merchant || '');

    // Determine statement period
    const today = new Date();
    const dueDay = card.due_day || 15;
    let statementStart = new Date(today.getFullYear(), today.getMonth(), dueDay);
    if (today.getDate() < dueDay) {
      statementStart = new Date(today.getFullYear(), today.getMonth() - 1, dueDay);
    }
    const statementPeriod = `${statementStart.getFullYear()}-${String(statementStart.getMonth() + 1).padStart(2, '0')}`;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        card_id: payload.card_id,
        user_id: profile.user_id,
        amount: Math.abs(payload.amount),
        currency: payload.currency || 'LKR',
        description: payload.description,
        merchant: payload.merchant || null,
        category,
        source: 'shortcut',
        tx_type: payload.tx_type || 'debit',
        tx_date: payload.tx_date || new Date().toISOString(),
        raw_message: payload.raw_message || null,
        statement_period: statementPeriod,
        is_pending: false,
        is_recurring: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update card balance
    const newBalance = card.current_balance + (payload.tx_type === 'credit' ? -payload.amount : payload.amount);
    await supabase
      .from('credit_cards')
      .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', payload.card_id);

    // Check budget alerts
    const { data: budget } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('category', category)
      .single();

    if (budget) {
      // Calculate current period spend
      const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', profile.user_id)
        .eq('category', category)
        .gte('tx_date', new Date(today.getFullYear(), today.getMonth(), 1).toISOString());

      const monthlySpend = (monthTransactions || []).reduce((sum, tx) => sum + tx.amount, 0);
      const spendPercent = (monthlySpend / budget.limit_amount) * 100;

      if (spendPercent > budget.alert_at_pct) {
        await supabase
          .from('alerts')
          .insert({
            user_id: profile.user_id,
            card_id: payload.card_id,
            alert_type: 'budget_exceeded',
            threshold: budget.limit_amount,
            message: `${category} spending exceeded ${budget.alert_at_pct}% of budget (${spendPercent.toFixed(0)}%)`,
            is_read: false,
            triggered_at: new Date().toISOString(),
          });
      }
    }

    return NextResponse.json(
      {
        success: true,
        transaction: { id: transaction?.id || null },
        message: 'Transaction recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
