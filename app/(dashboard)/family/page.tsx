import { createClient } from '@/lib/supabase/server'
import { Profile, Household } from '@/types'
import { Button } from '@/components/ui-creditlens/button'
import { Users, UserPlus, MoreVertical, Shield, Activity } from 'lucide-react'
import { Badge } from '@/components/ui-creditlens/badge'
import { cn } from '@/lib/utils'

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
  }

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Family & Members</div>
          <div className="page-sub">Collaborative credit management for {household?.name || 'your household'}</div>
        </div>
        <Button variant="primary">
          <UserPlus className="w-3.5 h-3.5" />
          Invite Member
        </Button>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Users className="w-3.5 h-3.5 text-accent" />
            Household Members ({members.length})
          </div>
        </div>
        <div className="card-body p-0">
          <div className="flex flex-col">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-5 border-b border-border hover:bg-bg3 transition-all last:border-0 relative group">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg font-bold shrink-0">
                  {member.full_name?.charAt(0) || 'U'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px]">{member.full_name}</span>
                    <Badge type="role" className={cn(
                      "text-[10px] uppercase tracking-widest px-1.5 py-0.5",
                      member.role === 'owner' ? "bg-accent/10 text-accent border border-accent/20" : "bg-bg4 text-text3 border border-border"
                    )}>
                      {member.role}
                    </Badge>
                    {member.id === user?.id && <span className="text-[10px] text-muted italic">(You)</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted mt-1.5">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Household Admin</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> 12 tx this month</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="h-8 px-3">Manage</Button>
                  <Button className="h-8 px-2"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}

            {!profile?.household_id && (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bg3 flex items-center justify-center border border-dashed border-border text-muted">
                  <Users className="w-8 h-8 opacity-20" />
                </div>
                <div className="max-w-[300px]">
                  <p className="text-text font-bold mb-1">No Household Found</p>
                  <p className="text-muted text-sm mb-6">Create a household to invite family members and share card details securely.</p>
                  <Button variant="primary">Create Household</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Shield className="w-3.5 h-3.5 text-blue" />
              Access Permissions
            </div>
          </div>
          <div className="card-body">
            <p className="text-[12px] text-muted mb-4">Manage what each role can see and do within the dashboard.</p>
            <div className="flex flex-col gap-2">
              {[
                { role: 'Owner', desc: 'Full access to everything.' },
                { role: 'Admin', desc: 'Can manage members and cards but cannot delete household.' },
                { role: 'Member', desc: 'Can add transactions and see limited reports.' }
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-bg3 rounded border border-border">
                  <div>
                    <div className="text-[12px] font-bold">{r.role}</div>
                    <div className="text-[10px] text-muted">{r.desc}</div>
                  </div>
                  <Button className="h-7 text-[10px]">View Detail</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <Activity className="w-3.5 h-3.5 text-green" />
              Member Activity
            </div>
          </div>
          <div className="card-body">
            <div className="h-[140px] flex items-center justify-center text-muted text-sm italic border border-dashed border-border rounded-lg bg-bg1/20">
              Activity graph placeholder
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
