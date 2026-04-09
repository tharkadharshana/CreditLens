import { createClient } from '@/lib/supabase/server'

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
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your account and preferences</div>
      </div>
      <div className="grid-2">
        <div>
          <div className="card mb-16">
            <div className="card-head"><div className="card-title">Profile</div></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-row"><label className="field-lbl">Full Name</label><input className="field" defaultValue={profile?.full_name || ''} /></div>
                <div className="form-row"><label className="field-lbl">Email</label><input className="field" value={user?.email || ''} readOnly disabled /></div>
                <div className="form-row"><label className="field-lbl">Currency</label><select className="field"><option defaultValue="LKR">LKR — Sri Lankan Rupee</option><option>USD</option><option>GBP</option></select></div>
                <div className="form-row"><label className="field-lbl">Time Zone</label><select className="field"><option defaultValue="Asia/Colombo">Asia/Colombo (UTC+5:30)</option></select></div>
              </div>
              <button className="btn btn-primary mt-16">Save Profile</button>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Danger Zone</div></div>
            <div className="card-body">
              <button className="btn" style={{ color: 'var(--red)', borderColor: 'rgba(244,86,106,0.3)', width: '100%', justifyContent: 'center' }}>Delete Account & All Data</button>
            </div>
          </div>
        </div>
        <div>
          <div className="card mb-16">
            <div className="card-head"><div className="card-title">Notifications</div></div>
            <div className="card-body">
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Payment due reminders</div><div className="toggle-desc">7 days before due date</div></div><div className="toggle on"></div></div>
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Large transaction alerts</div><div className="toggle-desc">Over LKR 10,000</div></div><div className="toggle on"></div></div>
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Budget exceeded</div><div className="toggle-desc">When category limit hit</div></div><div className="toggle on"></div></div>
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Statement ready</div><div className="toggle-desc">Monthly statement available</div></div><div className="toggle"></div></div>
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Weekly summary</div><div className="toggle-desc">Every Sunday morning</div></div><div className="toggle on"></div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Display</div></div>
            <div className="card-body">
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Mask balances</div><div className="toggle-desc">Hide amounts in UI</div></div><div className="toggle"></div></div>
              <div className="toggle-row"><div className="toggle-info"><div className="toggle-name">Compact view</div><div className="toggle-desc">Smaller transaction rows</div></div><div className="toggle"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
