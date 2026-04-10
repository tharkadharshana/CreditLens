import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard, Profile } from '@/types'
import { DashboardPageClient } from '@/components/dashboard/DashboardPageClient'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const [profileRes, cardsRes, txRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
  ])

  const profile = profileRes.data as Profile
  const cards = cardsRes.data as CreditCard[]
  const allTransactions = txRes.data as Transaction[]

  return <DashboardPageClient profile={profile} cards={cards} allTransactions={allTransactions} />
}
