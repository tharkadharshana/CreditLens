'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Smartphone, Flame, Search, Code } from 'lucide-react'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)
  const [appUrl, setAppUrl] = useState<string>('')
  const [discoveryData, setDiscoveryData] = useState<unknown[] | null>(null)
  const [loadingDiscovery, setLoadingDiscovery] = useState(false)

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
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          <Smartphone className="text-indigo-500" />
          iPhone Shortcut Setup <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded ml-2 border border-indigo-500/20 tracking-widest font-black">v1</span>
        </h1>
        <p className="text-[#94a3b8]">Automate your credit management with iPhone Shortcuts and API v1</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL Configuration */}
        <Card className="border-[#2d2d3d] bg-[#1a1a24] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">1</div>
              Shortcut Action: Get Contents of URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest">Ingestion Endpoint (v1)</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-[#0f0f13] p-2 rounded text-xs border border-[#2d2d3d] truncate text-indigo-300">
                  {appUrl}/api/v1/ingest
                </code>
                <Button size="icon" variant="ghost" className="hover:bg-indigo-500/10" onClick={() => copyToClipboard(`${appUrl}/api/v1/ingest`, 'url')}>
                  {copied === 'url' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest">Method</label>
              <code className="block bg-[#0f0f13] p-2 rounded text-xs border border-[#2d2d3d] text-white font-bold">POST</code>
            </div>
          </CardContent>
        </Card>

        {/* Discovery API */}
        <Card className="border-emerald-500/20 bg-[#1a1a24] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</div>
              Card Auto-Discovery (v1)
            </CardTitle>
            <CardDescription className="text-xs">Use this to find your Card IDs automatically in your shortcut.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#64748b] uppercase font-bold tracking-widest">Discovery URL</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-[#0f0f13] p-2 rounded text-xs border border-[#2d2d3d] truncate text-emerald-300">
                  {appUrl}/api/v1/ingest?api_key={apiKey.slice(0, 8)}...
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all gap-2"
                  onClick={fetchDiscovery}
                  disabled={loadingDiscovery}
                >
                  <Search className="w-3 h-3" />
                  {loadingDiscovery ? 'Fetching...' : 'Test Discovery'}
                </Button>
              </div>
            </div>

            {discoveryData && (
              <div className="mt-4 p-3 bg-[#0f0f13] rounded border border-[#2d2d3d] max-h-40 overflow-y-auto">
                <p className="text-[10px] text-emerald-500 font-bold mb-2 uppercase tracking-tight italic">Response Preview:</p>
                <pre className="text-[10px] text-[#94a3b8]">
                  {JSON.stringify(discoveryData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* HTTP Body Configuration */}
      <Card className="border-[#2d2d3d] bg-[#1a1a24] text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</div>
              HTTP Body (JSON)
            </CardTitle>
            <CardDescription className="text-xs">Copy this logic into your Shortcuts &quot;Dictionary&quot; action.</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-indigo-400 hover:bg-indigo-500/10"
            onClick={() => copyToClipboard(shortcutJson, 'json')}
          >
            {copied === 'json' ? <Check className="w-4 h-4 text-emerald-500" /> : <><Copy className="w-4 h-4 mr-2" /> Copy Schema</>}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-[#0f0f13] p-6 rounded-xl text-[11px] border border-[#2d2d3d] overflow-x-auto text-indigo-300 font-mono leading-relaxed">
              {shortcutJson}
            </pre>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Code className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logic: Regex</span>
              </div>
              <p className="text-xs text-[#94a3b8]">Extract the <strong>Amount</strong> and <strong>Merchant</strong> from the SMS using Regex.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Search className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logic: Discovery</span>
              </div>
              <p className="text-xs text-[#94a3b8]">Call the Discovery URL to find the <strong>card_id</strong> automatically.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logic: Post</span>
              </div>
              <p className="text-xs text-[#94a3b8]">Send everything to the Ingestion Endpoint via POST.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Flame className="w-24 h-24 text-indigo-500" />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Flame className="text-orange-500 w-5 h-5" />
            Quick Start Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#94a3b8]">
            <ul className="space-y-3 list-disc pl-5">
              <li>Open <strong>Shortcuts</strong> &gt; <strong>Automation</strong> &gt; <strong>Create Personal Automation</strong>.</li>
              <li>Select <strong>Message</strong> as the trigger.</li>
              <li>Filter messages by your bank&apos;s Sender Name.</li>
            </ul>
            <ul className="space-y-3 list-disc pl-5">
              <li>Use the <strong>Get Contents of URL</strong> action for all API calls.</li>
              <li>Set the &quot;Request Body&quot; to <strong>JSON</strong> and map your variables.</li>
              <li>Test by sending a manual POST to see it in the <strong>Live Feed</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
