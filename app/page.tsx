import Link from 'next/link'
import {
  Wallet, BarChart3, PiggyBank, Bell,
  ArrowRight, CheckCircle, TrendingUp,
  Users, Shield, Zap,
} from 'lucide-react'

const features = [
  {
    icon:  BarChart3,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Visual Analytics',
    desc:  'Beautiful charts showing income vs expenses, category breakdowns, and daily spending trends.',
  },
  {
    icon:  PiggyBank,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Smart Budgeting',
    desc:  'Set monthly limits per category. Get instant alerts when you are approaching or exceeding them.',
  },
  {
    icon:  Bell,
    color: 'bg-amber-50 text-amber-600',
    title: 'Real-time Alerts',
    desc:  'In-app and email notifications for budget exceeded, low balance, and weekly summaries.',
  },
  {
    icon:  TrendingUp,
    color: 'bg-rose-50 text-rose-600',
    title: 'CFO Insights',
    desc:  'Personalised savings suggestions based on your spending patterns — like a financial advisor.',
  },
  {
    icon:  Users,
    color: 'bg-purple-50 text-purple-600',
    title: 'Family & Individual',
    desc:  'Works for a single person or an entire family. Each member tracks their own spending.',
  },
  {
    icon:  Shield,
    color: 'bg-blue-50 text-blue-600',
    title: 'Secure & Private',
    desc:  'Your data stays yours. Bank-grade encryption. Login with Google or email — no phone needed.',
  },
]

const stats = [
  { label: 'Categories tracked',  value: '12+' },
  { label: 'Charts & insights',   value: '5'   },
  { label: 'Alert types',         value: '4'   },
  { label: 'Free forever',        value: '100%'},
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Wallet className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Budget by ZOD</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/register" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Smart finance tracking for families & individuals</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Take Control of Your<br />
              <span className="text-amber-300">Family Finances</span>
            </h1>
            <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
              Track every rupee, dollar, or euro. Set budgets, visualise spending patterns,
              and get personalised CFO-level insights to grow your savings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Start Tracking Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-indigo-200">
              {['No credit card needed', 'Free forever', 'Works for families'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-indigo-400">{s.value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to manage money better</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From daily spend tracking to annual reports — Budget by ZOD has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to get your finances on track?</h2>
          <p className="text-indigo-200 mb-8">
            Join thousands of families making smarter financial decisions every day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg shadow-xl"
          >
            Create Your Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Budget by ZOD · Built with ❤️ for families</p>
      </footer>
    </div>
  )
}
