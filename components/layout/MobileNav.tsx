'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Wallet, LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Bell, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard',               label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/transactions',  label: 'Transactions', icon: ArrowLeftRight  },
  { href: '/dashboard/budget',        label: 'Budget',       icon: PiggyBank       },
  { href: '/dashboard/analytics',     label: 'Analytics',    icon: BarChart3       },
  { href: '/dashboard/notifications', label: 'Alerts',       icon: Bell            },
  { href: '/dashboard/settings',      label: 'Settings',     icon: Settings        },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-400" />
                <span className="font-bold text-sm">Budget by ZOD</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = path === href || (href !== '/dashboard' && path.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-3 py-4 border-t border-gray-800">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
