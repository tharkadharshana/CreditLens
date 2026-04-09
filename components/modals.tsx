'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ModalProps {
  id: string
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  onConfirm: () => void
  confirmText?: string
}

export function Modal({ title, isOpen, onClose, children, onConfirm, confirmText = 'Confirm' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export function AddCardModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: '',
    card_name: '',
    nickname: '',
    last_four: '',
    network: 'visa',
    credit_limit: '',
    statement_day: '',
    due_day: '',
    card_color: '#1a1a2e'
  })

  const colors = [
    '#1a1a2e', '#0f3460', '#e94560', '#134e4a', '#92400e', '#334155'
  ]

  const handleConfirm = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('credit_cards').insert({
      user_id: user.id,
      bank_name: formData.bank_name,
      card_name: formData.card_name,
      last_four: formData.last_four,
      credit_limit: parseFloat(formData.credit_limit),
      card_color: formData.card_color,
      statement_day: parseInt(formData.statement_day),
      due_day: parseInt(formData.due_day)
    })

    if (!error) {
      onClose()
      router.refresh()
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <Modal id="add-card-modal" title="Add New Card" isOpen={isOpen} onClose={onClose} onConfirm={handleConfirm} confirmText={loading ? 'Adding...' : 'Add Card'}>
      <div className="form-grid">
        <div className="form-row"><label className="field-lbl">Bank Name</label><input className="field" placeholder="e.g. HSBC, Sampath" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Card Name</label><input className="field" placeholder="e.g. Platinum Visa" value={formData.card_name} onChange={e => setFormData({...formData, card_name: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Nickname</label><input className="field" placeholder="e.g. Daily card" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Last 4 Digits</label><input className="field" placeholder="0000" maxLength={4} value={formData.last_four} onChange={e => setFormData({...formData, last_four: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Network</label><select className="field" value={formData.network} onChange={e => setFormData({...formData, network: e.target.value})}><option value="visa">Visa</option><option value="mastercard">Mastercard</option><option value="amex">Amex</option></select></div>
        <div className="form-row"><label className="field-lbl">Credit Limit (LKR)</label><input className="field" type="number" placeholder="150000" value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Statement Day</label><input className="field" type="number" min="1" max="31" placeholder="25" value={formData.statement_day} onChange={e => setFormData({...formData, statement_day: e.target.value})} /></div>
        <div className="form-row"><label className="field-lbl">Payment Due Day</label><input className="field" type="number" min="1" max="31" placeholder="15" value={formData.due_day} onChange={e => setFormData({...formData, due_day: e.target.value})} /></div>
        <div className="form-row full"><label className="field-lbl">Card Colour</label>
          <div className="color-opts">
            {colors.map(c => (
              <div
                key={c}
                className={`color-opt ${formData.card_color === c ? 'sel' : ''}`}
                style={{ background: c }}
                onClick={() => setFormData({...formData, card_color: c})}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
