import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { User } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/login');
    }

    const userData: User = {
      id: user.id,
      email: user.email || 'user@example.com',
      created_at: user.created_at || new Date().toISOString(),
    };

    return (
      <DashboardShell user={userData}>
        {children}
      </DashboardShell>
    );
  } catch {
    // Fallback to login if any error occurs
    redirect('/login');
  }
}
