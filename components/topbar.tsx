'use client'

import { usePathname } from 'next/navigation'
import { Plus, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { AddCardModal } from '@/components/modals'

const BREADCRUMBS: Record<string, string> = {
  '/': 'Dashboard',
  '/cards': 'Cards',
  '/budgets': 'Budgets',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/livefeed': 'Live Feed',
  '/statement': 'Statement',
  '/family': 'Family',
  '/setup': 'Shortcut Helper',
  '/settings': 'Settings'
}

export function Topbar() {
  const pathname = usePathname()
  const pageTitle = BREADCRUMBS[pathname] || 'Dashboard'
  const [initials, setInitials] = useState('JD')
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const parts = user.email.split('@')[0].split(/[._-]/)
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[1][0]).toUpperCase())
        } else {
          setInitials(parts[0].substring(0, 2).toUpperCase())
        }
      }
    }
    getUser()
  }, [supabase.auth])

  return (
    <>
      <header className="topbar">
        <div className="breadcrumb">
          Lobby › <span>{pageTitle}</span>
        </div>

        <div className="topbar-right">
          <button className="btn">
            <Smartphone className="w-3.5 h-3.5" />
            Setup iPhone
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddCardOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Card
          </button>
          <div className="avatar">
            {initials}
          </div>
        </div>
      </header>
      <AddCardModal isOpen={isAddCardOpen} onClose={() => setIsAddCardOpen(false)} />
    </>
  )
}
