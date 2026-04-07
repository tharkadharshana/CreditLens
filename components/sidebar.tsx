'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  PieChart, 
  Settings, 
  History, 
  Smartphone,
  LogOut,
  Target,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Cards', icon: CreditCard, href: '/cards' },
  { label: 'Budgets', icon: Target, href: '/budgets' },
  { label: 'Transactions', icon: History, href: '/transactions' },
  { label: 'Analytics', icon: PieChart, href: '/analytics' },
  { label: 'Live Feed', icon: Activity, href: '/debug' },
  { label: 'Shortcut Helper', icon: Smartphone, href: '/setup' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-[#11111a] border-r border-[#2d2d3d] flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-500 flex items-center gap-2">
          CreditLens
        </h1>
        <p className="text-[10px] text-[#94a3b8] mt-1 font-mono uppercase tracking-widest">
          Command Centre
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]" 
                  : "text-[#94a3b8] hover:bg-[#1a1a24] hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-indigo-400" : "group-hover:text-white"
              )} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#2d2d3d] space-y-2">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start text-[#94a3b8] hover:text-white hover:bg-[#1a1a24]">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full justify-start text-red-400/80 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
