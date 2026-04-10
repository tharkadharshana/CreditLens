import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, Zap, BarChart3, Smartphone, Eye, Lock, TrendingUp, Users } from 'lucide-react';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090d] via-[#0f0f14] to-[#09090d] text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Credit<span className="text-purple-400">Lens</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</Link>
            <div className="flex gap-3">
              <Link href="/login" className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium shadow-lg shadow-purple-600/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now Live on iPhone
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight">
            Your iPhone.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Supercharged.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track all your credit cards in one place with instant iPhone shortcuts. Real-time analytics. Smart budgeting. Zero friction.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition shadow-lg shadow-purple-600/30 flex items-center gap-2">
              Start Free <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="px-8 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition">
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 pt-4">No credit card required • Instant access • Free for 14 days</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="text-purple-400 text-sm font-semibold tracking-widest">FEATURES</div>
            <h2 className="text-5xl font-bold">Everything you need for credit mastery</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {[
              {
                icon: Smartphone,
                title: 'iPhone Shortcuts',
                description: 'Capture transactions instantly. One tap, everything tracked.',
                color: 'text-blue-400',
              },
              {
                icon: Zap,
                title: 'Real-Time Sync',
                description: 'Live balance updates across all your cards instantly.',
                color: 'text-yellow-400',
              },
              {
                icon: BarChart3,
                title: 'Smart Analytics',
                description: 'Understand spending patterns with detailed breakdowns.',
                color: 'text-green-400',
              },
              {
                icon: TrendingUp,
                title: 'Budget Tracking',
                description: 'Set limits and get alerts when you\'re near them.',
                color: 'text-purple-400',
              },
              {
                icon: Users,
                title: 'Family Sharing',
                description: 'Share card tracking with family members securely.',
                color: 'text-pink-400',
              },
              {
                icon: Lock,
                title: 'Bank-Level Security',
                description: 'End-to-end encryption. Your data, your control.',
                color: 'text-red-400',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white/[0.02] border-r border-b border-white/5 last:border-r-0 p-8 hover:bg-white/5 transition">
                  <Icon size={28} className={feature.color} />
                  <h3 className="text-lg font-bold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white/5 border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { num: '50K+', label: 'Active Users' },
            { num: '$2B+', label: 'Tracked Monthly' },
            { num: '99.9%', label: 'Uptime' },
            { num: '4.9★', label: 'App Rating' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">{stat.num}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="text-purple-400 text-sm font-semibold tracking-widest">PRICING</div>
            <h2 className="text-5xl font-bold">Simple, transparent pricing</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$0',
                description: '14 days free',
                features: ['Up to 2 credit cards', 'Basic analytics', 'Community support'],
              },
              {
                name: 'Pro',
                price: '$5',
                description: 'per month, billed annually',
                popular: true,
                features: ['Unlimited cards', 'Advanced analytics', 'Priority support', 'Custom budgets', 'Transaction exports'],
              },
              {
                name: 'Family',
                price: '$9',
                description: 'per month, add up to 5 members',
                features: ['All Pro features', 'Family sharing', 'Shared budgets', 'Activity logs'],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-8 border transition ${
                  plan.popular
                    ? 'bg-purple-600/10 border-purple-500/50 md:scale-105'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="text-purple-400 text-xs font-bold tracking-widest mb-4">MOST POPULAR</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">{plan.price}</div>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                <Link href="/register" className={`w-full py-2 rounded-lg font-medium transition mb-8 block text-center ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border border-white/10 hover:bg-white/5'
                }`}>
                  Get Started
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">Ready to take control?</h2>
          <p className="text-xl text-gray-400">Join thousands tracking their credit smarter. Get started free today.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition shadow-lg shadow-purple-600/30">
              Start Free Trial
            </Link>
            <Link href="#pricing" className="px-8 py-3 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>© 2026 CreditLens. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
