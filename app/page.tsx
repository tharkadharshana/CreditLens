import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, CreditCard, BarChart3, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">💳 CreditLens</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
            Your Complete Credit Command Centre
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track all your credit cards in one place. Powered by iPhone Shortcuts for instant expense tracking.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="px-8 py-3 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 font-medium"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Why CreditLens?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: 'Multi-Card Tracking',
                description: 'Monitor all your credit cards simultaneously with real-time balance updates.',
              },
              {
                icon: Zap,
                title: 'Instant Tracking',
                description: 'Add transactions instantly from your iPhone. CreditLens catches every purchase.',
              },
              {
                icon: BarChart3,
                title: 'Smart Analytics',
                description: 'Understand your spending patterns with detailed analytics and category breakdowns.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-background border border-border rounded-xl p-8 space-y-4 hover:border-[hsl(var(--primary))] transition-colors">
                  <Icon size={32} className="text-[hsl(var(--primary))]" />
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8">
        <h2 className="text-4xl font-bold">Ready to Take Control?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start tracking your credit cards today. No credit card required.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 font-medium"
        >
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p>&copy; 2026 CreditLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
