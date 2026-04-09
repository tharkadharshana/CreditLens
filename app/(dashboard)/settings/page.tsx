import { createClient } from '@/lib/supabase/server'
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
          <div className="page-sub">Manage your account and app preferences</div>
        </div>
        <button 
          className="btn btn-primary"
        >
          Save Changes
        </button>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <User className="w-3.5 h-3.5 text-accent" />
                Profile Information
              </div>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-6 mb-8 group">
                <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-accent/20 border-4 border-bg2 relative overflow-hidden">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw600 fs18">{profile?.full_name || 'User'}</div>
                  <div className="text-muted fs13">{user?.email}</div>
                  <div className="cat-badge bg-accent/10 text-accent mt-2 h-5">Verified Account</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Full Name</label>
                  <input 
                    defaultValue={profile?.full_name} 
                    className="field"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Email Address</label>
                  <input 
                    value={user?.email || ''} 
                    disabled
                    className="field opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Globe className="w-3.5 h-3.5 text-blue" />
                Preferences
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Default Currency</label>
                  <select className="field">
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Language</label>
                  <select className="field">
                    <option value="en">English (US)</option>
                    <option value="si">Sinhala</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Shield className="w-3.5 h-3.5 text-red" />
                Security & API
              </div>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-bg1/40 border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="fs12 font-bold">Private API Key</span>
                  <span className="cat-badge bg-red/10 text-red border-red/20 text-[9px] h-4">SENSITIVE</span>
                </div>
                <p className="fs11 text-muted mb-3">Re-generate your key if you suspect it has been compromised.</p>
                <div className="flex gap-2">
                  <input type="password" value={profile?.api_key} readOnly className="field mono fs11" />
                  <button className="btn px-3"><RefreshCcw className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                {[
                  { icon: Shield, label: 'Change Password' },
                  { icon: Bell, label: 'Notification Settings' },
                  { icon: CreditCard, label: 'Linked Accounts' }
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg3 transition-all">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-muted" />
                      <span className="fs13">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-red/20 bg-red-bg/5">
            <div className="card-body p-6 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <div className="fw600 text-red">Danger Zone</div>
                <p className="fs11 text-muted">Delete account or sign out from all devices.</p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button className="btn flex-1 justify-center border-red/20 text-red hover:bg-red/5">Sign Out</button>
                <button className="btn flex-1 justify-center bg-red text-white hover:bg-red/90 border-red">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
