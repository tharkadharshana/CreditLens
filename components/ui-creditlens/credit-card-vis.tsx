'use client'

import React from 'react'

interface CreditCardVisProps {
  bank: string
  name: string
  last4: string
  limit: number
  balance: number
  color?: string
  network?: string
}

export function CreditCardVis({ bank, name, last4, limit, balance, color = '#1a1a2e', network = 'VISA' }: CreditCardVisProps) {
  const avail = limit - balance
  const pct = Math.round((balance / limit) * 100)
  const grad = `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`

  return (
    <div className="credit-card-vis" style={{ background: grad, color: '#fff' }}>
      <div className="cc-top">
        <div>
          <div className="cc-bank">{bank}</div>
          <div className="text-[10px] opacity-70 mt-0.5">{name}</div>
        </div>
        <div className="cc-network">{network}</div>
      </div>
      <div className="cc-number">**** **** **** {last4}</div>
      <div className="cc-bottom">
        <div>
          <div className="cc-name">Available</div>
          <div className="mono text-[13px] font-semibold">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(avail)}
          </div>
        </div>
        <div className="cc-limit">
          <div className="cc-limit-val">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(limit)}
          </div>
          <div className="cc-limit-lbl">Limit</div>
        </div>
      </div>
      <div className="cc-util-bar">
        <div 
          className="cc-util-fill transition-all duration-500" 
          style={{ 
            width: `${Math.min(pct, 100)}%`, 
            background: pct > 70 ? '#f4566a' : pct > 40 ? '#f5a623' : 'rgba(255,255,255,0.8)' 
          }} 
        />
      </div>
    </div>
  )
}
