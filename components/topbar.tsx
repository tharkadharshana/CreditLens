'use client'

import { usePathname } from 'next/navigation'
import { Plus, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui-creditlens/button'

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

  return (
    <header className="topbar">
      <div className="breadcrumb">Lobby › <span>{pageTitle}</span></div>
      <div className="topbar-right">
        <Button onClick={() => {}}>
          <Smartphone className="w-[13px] h-[13px]" />
          Setup iPhone
        </Button>
        <Button variant="primary" onClick={() => {}}>
          <Plus className="w-[13px] h-[13px]" />
          Add Card
        </Button>
        <div className="avatar">JD</div>
      </div>
    </header>
  )
}
