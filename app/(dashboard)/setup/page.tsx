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
        <div className="status-badge connected">
          <span className="pulse"></span> Endpoint Active
        </div>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          {/* API Credentials */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                API Credentials
              </div>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest block mb-1.5">Your Private API Key</label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={apiKey || 'Loading...'} 
                    type="password"
                    className="mono text-accent"
                  />
                  <Button onClick={() => copyToClipboard(apiKey, 'key')}>
                    {copied === 'key' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Never share this key. It grants full ingestion access.
                </p>
              </div>

              <div>
                <label className="text-[10px] text-muted uppercase tracking-widest block mb-1.5">Ingestion Endpoint (v1)</label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`${appUrl}/api/v1/ingest`} 
                    className="text-text2"
                  />
                  <Button onClick={() => copyToClipboard(`${appUrl}/api/v1/ingest`, 'url')}>
                    {copied === 'url' ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Zap className="w-3.5 h-3.5 text-amber" />
                Setup Steps
              </div>
            </div>
            <div className="card-body p-0">
              {[
                { step: 1, title: 'Create Shortcut', desc: 'Open Shortcuts app and create a new Personal Automation.', icon: Smartphone },
                { step: 2, title: 'Extract SMS', desc: 'Use Regex to extract Amount and Merchant from the bank SMS.', icon: Code },
                { step: 3, title: 'Get URL', desc: 'Call the Ingestion endpoint with a POST request.', icon: Globe },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 border-b border-border last:border-0 hover:bg-bg3 transition-all cursor-default group">
                  <div className="w-8 h-8 rounded-lg bg-bg4 flex items-center justify-center text-accent font-bold text-sm shrink-0 border border-border group-hover:border-accent">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-semibold text-[13px] flex items-center gap-2">
                      <s.icon className="w-3 h-3 opacity-50" />
                      {s.title}
                    </div>
                    <p className="text-muted text-[11px] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* JSON Payload */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Code className="w-3.5 h-3.5 text-blue" />
                JSON Payload
              </div>
              <Button onClick={() => copyToClipboard(shortcutJson, 'json')}>
                {copied === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="card-body p-0">
              <pre className="p-4 text-[11px] mono text-blue bg-[#0b0b0f] min-h-[160px] overflow-auto">
                {shortcutJson}
              </pre>
            </div>
          </div>

          {/* Discovery Tool */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Search className="w-3.5 h-3.5 text-green" />
                Auto-Discovery (v1)
              </div>
            </div>
            <div className="card-body flex flex-col gap-3">
              <p className="text-[11px] text-muted">Use this to fetch all your Card IDs in a single request. Useful for dynamic matching in Shortcuts.</p>
              <Button 
                variant="secondary" 
                className="w-full justify-center gap-2"
                onClick={fetchDiscovery}
                disabled={loadingDiscovery}
              >
                <Zap className="w-3.5 h-3.5" />
                {loadingDiscovery ? 'Running...' : 'Run Discovery Test'}
              </Button>
              {discoveryData && (
                <div className="mt-2 p-3 bg-bg3 rounded border border-border max-h-[120px] overflow-auto">
                  <pre className="text-[10px] mono text-green">
                    {JSON.stringify(discoveryData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 bg-accent-glow border-accent/20">
        <div className="card-body flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-accent">Pro Tip: Local Backups</div>
            <p className="text-[12px] text-text2">You can also setup Shortcuts to save a copy of every transaction in a local JSON file on your iCloud for redundancy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
