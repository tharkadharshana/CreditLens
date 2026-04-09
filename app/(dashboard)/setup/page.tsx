'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard } from '@/types'

export default function SetupPage() {
  const [apiKey, setApiKey] = useState<string>('')
  const [revealed, setRevealed] = useState(false)
  const [cards, setCards] = useState<CreditCard[]>([])
  const supabase = createClient()

  useEffect(() => {
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

        supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', data.user.id)
          .then(({ data: cardsData }) => {
            if (cardsData) setCards(cardsData)
          })
      }
    })
  }, [supabase])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const steps = [
    { title: 'Get your API key', desc: 'Copy your unique API key below. Keep it secret — it authenticates your iPhone Shortcuts.' },
    { title: 'Get your Card ID', desc: 'Each card has a unique ID. Find yours in the "Your Card IDs" panel on the right. Copy the ID for the card you want to track.' },
    { title: 'Open iPhone Shortcuts app', desc: 'Tap (+) to create a new Shortcut. Name it "Log Credit Spend".' },
    { title: 'Add a "Get Contents of URL" action', desc: 'Set method to POST, URL to your app URL + /api/v1/ingest. Add a JSON body:', code: '{\n  "api_key": "YOUR_API_KEY",\n  "card_id": "YOUR_CARD_ID",\n  "amount": [Ask for Input: number],\n  "description": [Ask for Input: text],\n  "category": [Choose from List],\n  "tx_type": "debit",\n  "currency": "LKR"\n}' },
    { title: 'Add to Home Screen', desc: 'Tap the share icon and choose "Add to Home Screen". Now you can log a transaction with one tap from your iPhone home screen.' },
    { title: 'Test it', desc: 'Use the Test Endpoint panel on the right to verify your setup is working before using in real life.' },
  ]

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Shortcut Helper</div>
        <div className="page-sub">Connect your iPhone to automatically log transactions</div>
      </div>
      <div className="grid-60-40">
        <div className="card">
          <div className="card-head"><div className="card-title">Setup Guide</div></div>
          <div className="card-body">
            {steps.map((s, i) => (
              <div key={i} className="shortcut-step">
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                  {s.code && <div className="code-block" dangerouslySetInnerHTML={{ __html: s.code.replace(/\n/g, '<br>') }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-head"><div className="card-title">Your API Key</div></div>
            <div className="card-body">
              <div className="api-key-row">
                <span className="api-key-val">{revealed ? apiKey : '••••••••••••••••••••••••••••••••'}</span>
                <button className="btn" onClick={() => setRevealed(!revealed)}>{revealed ? 'Hide' : 'Reveal'}</button>
                <button className="btn" onClick={() => copyToClipboard(apiKey)}>Copy</button>
              </div>
              <div className="text-muted fs11 mt-16">Keep this key secret. Use it in your Shortcut to authenticate requests.</div>
              <button className="btn mt-16" style={{ color: 'var(--red)', borderColor: 'var(--red-bg)' }}>⟳ Regenerate Key</button>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Your Card IDs</div></div>
            <div className="card-body">
              {cards.map(c => (
                <div key={c.id} style={{ marginBottom: '12px' }}>
                  <div className="fs12 fw600 mb-8">{c.bank_name} {c.card_name} ···{c.last_four}</div>
                  <div className="api-key-row">
                    <span className="api-key-val" style={{ fontSize: '10px' }}>{c.id}</span>
                    <button className="btn" onClick={() => copyToClipboard(c.id)}>Copy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Test Endpoint</div></div>
            <div className="card-body">
              <div className="text-muted fs12 mb-16">Send a test transaction to verify your Shortcut is working.</div>
              <select className="field mb-8" style={{ width: '100%' }}>
                <option>Select card to test…</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.bank_name} {c.card_name}</option>)}
              </select>
              <button className="btn btn-primary" style={{ width: '100%' }}>Send Test Transaction</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
