import { createClient } from '@/lib/supabase/server'
import { Profile, Household } from '@/types'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FamilyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get profile to find household_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  let members: Profile[] = []
  let household: Household | null = null

  if (profile?.household_id) {
    const [householdRes, membersRes] = await Promise.all([
      supabase.from('households').select('*').eq('id', profile.household_id).single(),
      supabase.from('profiles').select('*').eq('household_id', profile.household_id)
    ])
    household = householdRes.data
    members = membersRes.data || []
  } else {
      // Fallback/Mock for UI if no household
      members = [
          { id: '1', full_name: 'John Dharshana', email: user?.email || '', role: 'owner' } as unknown as Profile
      ]
  }

  // Use household to avoid unused var
  console.log('Household:', household?.name || 'None')

  const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', user?.id)

  const formatLKR = (val: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Family Management</div>
          <div className="page-sub">Manage household members and shared cards</div>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-[13px] h-[13px]" />
          Invite Member
        </button>
      </div>

      <div className="grid-60-40">
        <div className="card">
          <div className="card-head"><div className="card-title">Household Members</div></div>
          <div id="family-members">
            {members.map(m => {
                const initials = m.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                const roleLabels: Record<string, {bg: string, color: string, label: string}> = {
                    owner: { bg: 'rgba(124,108,250,0.15)', color: '#7c6cfa', label: 'Owner' },
                    admin: { bg: 'rgba(245,166,35,0.15)', color: '#f5a623', label: 'Admin' },
                    member: { bg: 'rgba(34,211,160,0.15)', color: '#22d3a0', label: 'Member' }
                }
                const r = roleLabels[m.role || 'member'] || roleLabels.member
                return (
                    <div key={m.id} className="member-item">
                        <div className="member-avatar" style={{ background: `${r.color}22`, color: r.color }}>{initials}</div>
                        <div className="member-info"><div className="member-name">{m.full_name}</div><div className="member-email">{ 'No email' }</div></div>
                        <span className="role-badge" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                        {m.role !== 'owner' && <button className="btn" style={{ fontSize: '11px' }}>Manage</button>}
                    </div>
                )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-head"><div className="card-title">This Month&apos;s Spend by Member</div></div>
            <div className="card-body">
              <div id="family-spend-chart">
                {/* Mocked data for family spend visualization */}
                {[
                    { name: 'John', amount: 38450, color: '#7c6cfa' },
                    { name: 'Nisha', amount: 14200, color: '#22d3a0' },
                    { name: 'Kavya', amount: 5800, color: '#f5a623' }
                ].map(s => {
                    const maxS = 38450
                    return (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ minWidth: '48px', fontSize: '12px', color: 'var(--text2)' }}>{s.name}</div>
                            <div style={{ flex: 1 }}><div className="pct-bar" style={{ height: '8px' }}><div className="pct-fill" style={{ width: `${Math.round((s.amount / maxS) * 100)}%`, backgroundColor: s.color }}></div></div></div>
                            <div className="mono fs12">{formatLKR(s.amount)}</div>
                        </div>
                    )
                })}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Shared Cards</div></div>
            <div className="card-body" id="shared-cards-list">
                {cards?.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.card_color }}></div>
                        <div style={{ flex: 1, fontSize: '13px' }}>{c.bank_name} {c.card_name}</div>
                        <div className="toggle on"></div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
