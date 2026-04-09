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
      <div className="breadcrumb">
        Main / <span>{pageTitle}</span>
      </div>
      
      <div className="topbar-right">
        <Link href="/cards/new">
          <button className="btn btn-primary">
            <Plus className="w-3.5 h-3.5" />
            Add New Card
          </button>
        </Link>
        <div className="avatar">
          JD
        </div>
      </div>
    </header>
  )
}
