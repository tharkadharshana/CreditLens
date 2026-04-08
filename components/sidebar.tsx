'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  Clock, 
  List, 
  Activity, 
  Smartphone,
  LogOut,
  Settings,
  LineChart,
  FileText,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItemType {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  iconComponent?: React.ComponentType<{ className?: string }>
}

const mainNav: NavItemType[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Cards', icon: CreditCard, href: '/cards' },
  { label: 'Budgets', icon: Clock, href: '/budgets' },
  { label: 'Transactions', icon: List, href: '/transactions' },
]

const insightsNav: NavItemType[] = [
  { label: 'Analytics', icon: LineChart, href: '/analytics' },
  { label: 'Live Feed', icon: Activity, href: '/livefeed' },
  { label: 'Statement', icon: FileText, href: '/statement' },
]

const setupNav: NavItemType[] = [
  { label: 'Family', icon: Users, href: '/family' },
  { label: 'Shortcut Helper', iconComponent: Smartphone, href: '/setup' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const NavItem = ({ item }: { item: NavItemType }) => {
    const isActive = pathname === item.href
    const Icon = item.iconComponent || item.icon
    
    return (
      <Link 
        href={item.href}
        className={cn(
          "nav-item",
          isActive && "active"
        )}
      >
        {Icon && <Icon className="w-[15px] h-[15px] flex-shrink-0 opacity-80" />}
        {item.label}
        {item.label === 'Transactions' && <span className="nav-badge">3</span>}
      </Link>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">Credit<span>Lens</span></div>
        <div className="logo-sub">Command Centre</div>
      </div>
      <nav className="nav">
        <div className="nav-section">Main</div>
        {mainNav.map(item => <NavItem key={item.href} item={item} />)}
        
        <div className="nav-section">Insights</div>
        {insightsNav.map(item => <NavItem key={item.href} item={item} />)}
        
        <div className="nav-section">Setup</div>
        {setupNav.map(item => <NavItem key={item.href} item={item} />)}
      </nav>
      
      <div className="sidebar-footer">
        <Link 
          href="/settings"
          className={cn("nav-item", pathname === '/settings' && "active")}
        >
          <Settings className="w-[15px] h-[15px] flex-shrink-0 opacity-80" />
          Settings
        </Link>
        <div className="nav-item" style={{ color: 'var(--red)' }} onClick={handleSignOut}>
          <LogOut className="w-[15px] h-[15px] flex-shrink-0 opacity-80" />
          Sign Out
        </div>
      </div>
    </aside>
  )
}
