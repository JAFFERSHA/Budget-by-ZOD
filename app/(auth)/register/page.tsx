'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [error,         setError]         = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setError('')
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const json = await res.json()

    if (!res.ok) { setError(json.error ?? 'Registration failed.'); return }

    // Auto sign-in after register
    await signIn('credentials', {
      email:    data.email,
      password: data.password,
      redirect: false,
    })
    router.push('/dashboard')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-6">Start tracking your finances in minutes — free</p>

      <Button
        type="button"
        variant="secondary"
        loading={googleLoading}
        onClick={handleGoogle}
        className="w-full mb-4"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Jane Smith"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
