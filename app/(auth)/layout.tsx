import { Wallet } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <Wallet className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="font-bold text-white text-xl">Budget by ZOD</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-6 text-indigo-300 text-xs">
        © {new Date().getFullYear()} Budget by ZOD · Free forever
      </p>
    </div>
  )
}
