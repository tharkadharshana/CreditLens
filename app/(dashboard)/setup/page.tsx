'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui-creditlens/button'
import { Input } from '@/components/ui-creditlens/form'
import { 
  Copy, 
  Check, 
  Smartphone, 
  Flame, 
  Search, 
  Code, 
  Globe, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)
  const [appUrl, setAppUrl] = useState<string>('')
  const [loadingDiscovery, setLoadingDiscovery] = useState(false)
  const [discoveryData, setDiscoveryData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('api_key')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setApiKey(profile.api_key)
          })
      }
    })
    setAppUrl(window.location.origin)
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const fetchDiscovery = async () => {
    setLoadingDiscovery(true)
    try {
      const res = await fetch(`${appUrl}/api/v1/ingest?api_key=${apiKey}`)
      const data = await res.json()
      setDiscoveryData(data)
    } catch (err) {
      console.error(err)
    }
    setLoadingDiscovery(false)
  }

  const shortcutJson = `{
  "api_key": "${apiKey}",
  "card_id": "AUTO_DISCOVERED_ID",
  "amount": "TX_AMOUNT",
  "merchant": "MERCHANT_NAME",
  "description": "FULL_MESSAGE",
  "tx_type": "debit"
}`

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Shortcut Helper</div>
          <div className="page-sub">Connect your iPhone to automate tracking</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-green uppercase tracking-widest pl-3 border-l border-border">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" /> Endpoint Active
        </div>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                API Credentials
              </div>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Private API Key</label>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={apiKey || 'Loading...'} 
                      type="password"
                      className="field mono text-accent"
                    />
                    <button className="btn" onClick={() => copyToClipboard(apiKey, 'key')}>
                      {copied === 'key' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="fs11 text-muted mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Never share this key. It grants full ingestion access.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-muted uppercase tracking-widest font-bold block mb-2">Ingestion Endpoint (v1)</label>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={`${appUrl}/api/v1/ingest`} 
                      className="field text-muted fs12"
                    />
                    <button className="btn" onClick={() => copyToClipboard(`${appUrl}/api/v1/ingest`, 'url')}>
                      {copied === 'url' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Zap className="w-3.5 h-3.5 text-amber" />
                Setup Steps
              </div>
            </div>
            <div className="card-body p-0">
              <div className="flex flex-col">
                {[
                  { step: 1, title: 'Create Shortcut', desc: 'Open Shortcuts app and create a new Personal Automation.', icon: Smartphone },
                  { step: 2, title: 'Extract SMS', desc: 'Use Regex to extract Amount and Merchant from the bank SMS.', icon: Code },
                  { step: 3, title: 'Get URL', desc: 'Call the Ingestion endpoint with a POST request.', icon: Globe },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 p-5 border-b border-border last:border-0 hover:bg-bg3 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-bg4 flex items-center justify-center text-accent font-bold text-lg shrink-0 border border-border group-hover:border-accent">
                      {s.step}
                    </div>
                    <div>
                      <div className="fw600 fs13 flex items-center gap-2">
                        {s.title}
                      </div>
                      <p className="text-muted fs11 mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Code className="w-3.5 h-3.5 text-blue" />
                JSON Payload
              </div>
              <button className="btn h-7 px-2" onClick={() => copyToClipboard(shortcutJson, 'json')}>
                {copied === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="card-body p-0">
              <div className="p-4 fs11 mono text-blue bg-[#0b0b0f] min-h-[160px] overflow-auto">
                {shortcutJson.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Search className="w-3.5 h-3.5 text-green" />
                Auto-Discovery (v1)
              </div>
            </div>
            <div className="card-body">
              <p className="fs11 text-muted mb-4">Fetch all your Card IDs in a single request for dynamic matching.</p>
              <button 
                className={cn("btn btn-primary w-full justify-center gap-2", loadingDiscovery && "opacity-50")}
                onClick={fetchDiscovery}
                disabled={loadingDiscovery}
              >
                <Zap className="w-3.5 h-3.5" />
                {loadingDiscovery ? 'Running...' : 'Run Discovery Test'}
              </button>
              {discoveryData && (
                <div className="mt-4 p-4 bg-bg3 rounded border border-border max-h-[160px] overflow-auto">
                  <pre className="fs10 mono text-green">
                    {JSON.stringify(discoveryData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 bg-accent/[0.03] border-accent/20 border-dashed">
        <div className="card-body p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="fw600 text-accent">Pro Tip: Local Backups</div>
            <p className="fs12 text-muted mt-1">Save a copy of every transaction in a local JSON file on your iCloud for redundancy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
