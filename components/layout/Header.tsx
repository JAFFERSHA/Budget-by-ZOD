'use client'

import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { MobileNav } from './MobileNav'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileNav />
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? ''}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{user?.name ?? 'User'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
