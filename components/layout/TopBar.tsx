'use client';

import { User } from '@/types';

interface TopBarProps {
  user?: User;
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="border-b border-border bg-card h-16 flex items-center justify-between px-8">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">
          Welcome back! 👋
        </h1>
      </div>

      {/* Right side stats or user actions can go here */}
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <p className="text-foreground font-medium">{user?.email || 'User'}</p>
          <p className="text-muted-foreground text-xs">Account</p>
        </div>
      </div>
    </header>
  );
}
