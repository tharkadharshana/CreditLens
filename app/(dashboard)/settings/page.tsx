import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui-creditlens/button'
import { Input, Select } from '@/components/ui-creditlens/form'
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  RefreshCcw,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui-creditlens/badge'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage your profile, account preferences and security</div>
        </div>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          {/* Profile Section */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <User className="w-3.5 h-3.5 text-accent" />
                Profile Information
              </div>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="flex items-center gap-4 py-2 border-b border-border border-dashed mb-2">
                <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-[16px]">{profile?.full_name}</div>
                  <div className="text-[12px] text-muted">{user?.email}</div>
                  <Button className="h-7 mt-2 text-[10px]">Change Avatar</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold">Full Name</label>
                  <Input defaultValue={profile?.full_name} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold">Email</label>
                  <Input defaultValue={user?.email} readOnly disabled />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Globe className="w-3.5 h-3.5 text-blue" />
                Preferences
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold">Default Currency</label>
                  <Select>
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold">Language</label>
                  <Select>
                    <option value="en">English (US)</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Security & API Section */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Shield className="w-3.5 h-3.5 text-red" />
                Security & API
              </div>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-bg3 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-bold">Private API Key</span>
                  <Badge type="role" className="bg-red/10 text-red border-red/20 text-[9px]">SENSITIVE</Badge>
                </div>
                <p className="text-[11px] text-muted mb-3">Re-generate your key if you suspect it has been compromised.</p>
                <div className="flex gap-2">
                  <Input type="password" value={profile?.api_key} readOnly className="mono text-[11px]" />
                  <Button className="h-9 px-3"><RefreshCcw className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { icon: Shield, label: 'Change Password', color: 'text-text2' },
                  { icon: Bell, label: 'Notification Settings', color: 'text-text2' },
                  { icon: CreditCard, label: 'Linked Accounts', color: 'text-text2' }
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg3 transition-all">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-red/20 bg-red-bg/5">
            <div className="card-body p-6 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="font-bold text-red">Danger Zone</div>
                <p className="text-[11px] text-muted">Delete account or sign out from all devices.</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <Button className="flex-1 justify-center border-red/20 text-red hover:bg-red/10">Sign Out</Button>
                <Button className="flex-1 justify-center bg-red border-red text-white hover:bg-red/90">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
