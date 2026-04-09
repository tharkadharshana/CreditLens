'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Cards', href: '/cards' },
  { label: 'Budgets', href: '/budgets' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Live Feed', href: '/livefeed' },
  { label: 'Statement', href: '/statement' },
  { label: 'Family', href: '/family' },
  { label: 'Shortcut Helper', href: '/shortcut' },
];

interface SidebarProps {
  user?: { email?: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] border-r border-border bg-card flex flex-col h-screen overflow-hidden">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="text-xl font-bold text-foreground">
          💳 CreditLens
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium
              transition-all duration-200 relative
              ${
                isActive(item.href)
                  ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
          >
            {isActive(item.href) && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--primary))] rounded-r" />
            )}
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-4 space-y-2">
        <Link
          href="/settings"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium
            transition-all duration-200
            ${
              isActive('/settings')
                ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }
          `}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium
            text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Email */}
      <div className="border-t border-border p-4 text-xs text-muted-foreground truncate">
        {user?.email || 'user@example.com'}
      </div>
    </aside>
  );
}
