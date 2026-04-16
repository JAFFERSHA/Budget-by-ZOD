'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank,
  BarChart3, Bell, Settings, LogOut, Wallet,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { href: '/dashboard/budget',       label: 'Budget',       icon: PiggyBank       },
  { href: '/dashboard/analytics',    label: 'Analytics',    icon: BarChart3       },
  { href: '/dashboard/notifications',label: 'Alerts',       icon: Bell            },
  { href: '/dashboard/settings',     label: 'Settings',     icon: Settings        },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">Budget by ZOD</p>
          <p className="text-xs text-gray-400 mt-0.5">Finance Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
