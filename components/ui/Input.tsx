import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  prefix?:  string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500',
            'focus:border-indigo-500 transition-colors',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-400 focus:ring-red-400',
            prefix && 'pl-7',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
