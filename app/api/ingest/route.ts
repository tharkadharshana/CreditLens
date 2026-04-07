import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { IngestPayload } from '@/types'
import { inferCategory } from '@/lib/utils/categories'
import { getCurrentStatementPeriod } from '@/lib/utils/statement'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Use service role to bypass RLS
)

export async function POST(request: NextRequest) {
  try {
    const body: IngestPayload = await request.json()

    // 1. Validate API key → get user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, household_id')
      .eq('api_key', body.api_key)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 2. Validate card belongs to user or household
    const { data: card } = await supabaseAdmin
      .from('credit_cards')
      .select('id, household_id, statement_day')
      .eq('id', body.card_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // 3. Auto-categorize if category not provided
    const category = body.category || inferCategory(body.description, body.merchant || '')

    // 4. Determine statement period
    const statementPeriod = getCurrentStatementPeriod(
      body.tx_date ? new Date(body.tx_date) : new Date(),
      card.statement_day
    )

    // 5. Insert transaction
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        card_id: body.card_id,
        user_id: profile.id,
        household_id: profile.household_id,
        amount: Math.abs(body.amount),
        currency: body.currency || 'LKR',
        description: body.description,
        merchant: body.merchant || null,
        category,
        source: 'shortcut',
        raw_message: body.raw_message || null,
        tx_type: body.tx_type || 'debit',
        tx_date: body.tx_date || new Date().toISOString().split('T')[0],
        statement_period: statementPeriod,
        family_member: body.family_member || null,
        added_by: profile.id,
      })
      .select()
      .single()

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // 6. Check for budget alerts (fire and forget)
    checkBudgetAlerts(profile.id, body.card_id, category, supabaseAdmin)

    return NextResponse.json({
      success: true,
      transaction_id: tx.id,
      message: `Transaction of ${body.amount} recorded successfully`
    }, { status: 201 })

  } catch (err) {
    console.error('Ingest error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function checkBudgetAlerts(
  userId: string, cardId: string, category: string, supabase: any
) {
  // Get active budgets for this category
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('category', category)
    .eq('is_active', true)

  for (const budget of budgets || []) {
    // Calculate current spend in period
    const startDate = new Date()
    if (budget.period === 'monthly') startDate.setDate(1)
    if (budget.period === 'weekly') startDate.setDate(startDate.getDate() - 7)

    const { data: txSum } = await supabase
      .from('transactions')
      .select('amount')
      .eq('card_id', cardId)
      .eq('category', category)
      .eq('tx_type', 'debit')
      .gte('tx_date', startDate.toISOString().split('T')[0])

    const totalSpend = (txSum || []).reduce((sum: number, t: any) => sum + t.amount, 0)
    const pctUsed = (totalSpend / budget.limit_amount) * 100

    if (pctUsed >= budget.alert_at_pct) {
      await supabase.from('alerts').insert({
        user_id: userId,
        card_id: cardId,
        alert_type: pctUsed >= 100 ? 'budget_exceeded' : 'limit_near',
        threshold: budget.limit_amount,
        message: `${category} budget is ${Math.round(pctUsed)}% used (${totalSpend} / ${budget.limit_amount})`,
      })
    }
  }
}
