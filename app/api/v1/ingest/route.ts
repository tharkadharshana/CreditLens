import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { IngestPayload } from '@/types'
import { inferCategory } from '@/lib/utils/categories'
import { getCurrentStatementPeriod } from '@/lib/utils/statement'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get('api_key')

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Validate API key → get user
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  // 2. Get user's cards
  const { data: cards, error: cardsError } = await supabaseAdmin
    .from('credit_cards')
    .select('id, bank_name, card_name, last_four')
    .eq('user_id', profile.id)

  if (cardsError) {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }

  return NextResponse.json(cards)
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body: IngestPayload = await request.clone().json()

    // 1. Validate API key → get user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, household_id')
      .eq('api_key', body.api_key)
      .single()

    if (profileError || !profile) {
      await supabaseAdmin.from('ingestion_logs').insert({
        status: 'error',
        error_message: 'Invalid API key attempt',
        raw_payload: body as any // eslint-disable-line @typescript-eslint/no-explicit-any
      })
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 2. Validate card exists
    const { data: card } = await supabaseAdmin
      .from('credit_cards')
      .select('id, household_id, statement_day')
      .eq('id', body.card_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // 3. Auto-categorize
    const category = body.category || inferCategory(body.description, body.merchant || '')

    // 4. Statement period
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
      await supabaseAdmin.from('ingestion_logs').insert({
        user_id: profile.id,
        status: 'error',
        error_message: txError.message,
        raw_payload: body as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        merchant: body.merchant,
        amount: body.amount
      })
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // Success log
    await supabaseAdmin.from('ingestion_logs').insert({
      user_id: profile.id,
      status: 'success',
      raw_payload: body as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      merchant: body.merchant,
      amount: body.amount
    })

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
