import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryProvider }   from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title:       'Budget by ZOD — Family Finance Tracker',
  description: 'Track your family finances, manage budgets, and get smart savings suggestions.',
  keywords:    'budget, finance, family, spending tracker, expense manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
